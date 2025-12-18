const { Order, OrderItem, Product, Supplier, User, ProductMovementLog, AuditLog } = require("../models");
const sequelize = require("../db");

// --- GET ALL ORDERS ---
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: Supplier, as: "supplier", attributes: ["name"] },
        { model: User, as: "creator", attributes: ["username"] },
        { model: OrderItem, as: "items" } // Include items count/details if needed
      ],
      order: [["created_at", "DESC"]]
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- GET SINGLE ORDER DETAILS ---
exports.getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        { model: Supplier, as: "supplier" },
        { model: User, as: "creator", attributes: ["username"] },
        { 
          model: OrderItem, 
          as: "items",
          include: [{ model: Product, as: "product", attributes: ["name", "sku"] }]
        }
      ]
    });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- CREATE PURCHASE ORDER ---
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { supplier_id, expected_delivery, notes, items } = req.body;
    // items = [{ product_id, quantity, unit_cost }, ...]

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must contain items." });
    }

    // 1. Calculate Total Cost
    const total_cost = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

    // 2. Create Order Header
    const order = await Order.create({
      supplier_id,
      user_id: req.user.id,
      status: "PENDING",
      total_cost,
      expected_delivery,
      notes
    }, { transaction });

    // 3. Create Order Items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost
    }));
    await OrderItem.bulkCreate(orderItems, { transaction });

    await AuditLog.create({
      user_id: req.user.id,
      action: "CREATE_ORDER",
      details: `Created PO #${order.id} ($${total_cost})`,
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create order." });
  }
};

// --- RECEIVE ORDER (Updates Inventory) ---
exports.receiveOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, { include: ["items"] });

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Order already processed." });
    }

    // 1. Update Inventory for each item
    for (const item of order.items) {
      // Find product
      const product = await Product.findByPk(item.product_id);
      if (product) {
        // Increase quantity
        await product.increment('quantity', { by: item.quantity, transaction });
        
        // Log Movement
        await ProductMovementLog.create({
          product_id: item.product_id,
          user_id: req.user.id,
          movement_type: "IN", // or "RECEIPT"
          quantity_change: item.quantity,
          transaction_notes: `PO #${order.id} Received`,
          to_location: product.location // Assumes goes to default location
        }, { transaction });
      }
    }

    // 2. Update Order Status
    await order.update({ status: "RECEIVED" }, { transaction });

    await AuditLog.create({
      user_id: req.user.id,
      action: "RECEIVE_ORDER",
      details: `Received PO #${order.id}`,
      ip_address: req.ip
    }, { transaction });

    await transaction.commit();
    res.json({ success: true, message: "Order received and inventory updated." });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to receive order." });
  }
};