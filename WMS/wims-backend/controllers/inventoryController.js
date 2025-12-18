const { Product, ProductMovementLog, AuditLog } = require("../models");
const sequelize = require("../db");

// --- GET PRODUCTS ---
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ order: [["id", "DESC"]] });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Inventory Fetch Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching inventory." });
  }
};

// --- CREATE PRODUCT ---
exports.createProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      name,
      sku,
      quantity,
      location,
      category,
      reorder_point,
      unit_cost,
      expiration_date,
      description,
    } = req.body;

    if (!name || !sku || quantity === undefined) {
      await transaction.rollback();
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, SKU, and Quantity are required.",
        });
    }

    const existing = await Product.findOne({ where: { sku } });
    if (existing) {
      await transaction.rollback();
      return res
        .status(409)
        .json({ success: false, message: "SKU already exists." });
    }

    const product = await Product.create(
      {
        name,
        sku,
        quantity,
        location,
        category,
        reorder_point,
        unit_cost,
        expiration_date,
        description,
      },
      { transaction }
    );

    if (quantity > 0) {
      await ProductMovementLog.create(
        {
          product_id: product.id,
          user_id: req.user.id,
          movement_type: "IN",
          quantity_change: quantity,
          to_location: location,
          transaction_notes: "Initial Stock",
        },
        { transaction }
      );
    }

    await AuditLog.create(
      {
        user_id: req.user.id,
        action: "CREATE_PRODUCT",
        details: `Created product ${sku} (${name})`,
        ip_address: req.ip,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    await transaction.rollback();
    console.error("Create Product Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create product." });
  }
};

// --- UPDATE PRODUCT ---
exports.updateProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    // Explicitly grab all fields from body
    const {
      name,
      quantity,
      location,
      category,
      reorder_point,
      unit_cost,
      expiration_date,
      description,
    } = req.body;

    console.log(`Updating Product ID ${id} with:`, req.body); // Debug Log

    const product = await Product.findByPk(id);
    if (!product) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    // Handle Quantity Change Logic
    const oldQuantity = product.quantity;
    const newQuantity = parseInt(quantity);

    if (oldQuantity !== newQuantity) {
      const diff = newQuantity - oldQuantity;
      const type = diff > 0 ? "IN" : "OUT";

      await ProductMovementLog.create(
        {
          product_id: product.id,
          user_id: req.user.id,
          movement_type: "ADJUSTMENT", // Using 'ADJUSTMENT' or 'IN'/'OUT' depending on your ENUM preference
          quantity_change: diff,
          from_location: product.location,
          to_location: location,
          transaction_notes: `Manual Update (${type})`,
        },
        { transaction }
      );
    }

    // Perform Update
    await product.update(
      {
        name,
        quantity,
        location,
        category,
        reorder_point,
        unit_cost,
        expiration_date, // Ensure this matches DB column exactly
        description,
      },
      { transaction }
    );

    await AuditLog.create(
      {
        user_id: req.user.id,
        action: "UPDATE_PRODUCT",
        details: `Updated SKU ${product.sku}`,
        ip_address: req.ip,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    await transaction.rollback();
    console.error("Update Product Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update product." });
  }
};

// --- DELETE PRODUCT ---
exports.deleteProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    await AuditLog.create(
      {
        user_id: req.user.id,
        action: "DELETE_PRODUCT",
        details: `Deleted product ${product.sku}`,
        ip_address: req.ip,
      },
      { transaction }
    );

    await product.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ success: true, message: "Product deleted." });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ success: false, message: "Failed to delete product." });
  }
};
