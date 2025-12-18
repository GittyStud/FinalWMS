const { Product, ProductMovementLog, User } = require("../models");
const sequelize = require("../db");
const { Op } = require("sequelize");

// --- 1. Get Movement Logs ---
exports.getMovementLogs = async (req, res) => {
  try {
    const logs = await ProductMovementLog.findAll({
      include: [
        { model: Product, as: "product", attributes: ["sku", "name"] },
        { model: User, as: "user", attributes: ["username"] },
      ],
      order: [["timestamp", "DESC"]],
    });

    // Format for frontend
    const formatted = logs.map((l) => ({
      id: l.id,
      product_sku: l.product?.sku || "Deleted",
      product_name: l.product?.name || "Deleted",
      user_name: l.user?.username || "System",
      movement_type: l.movement_type,
      quantity_change: l.quantity_change,
      from_location: l.from_location,
      to_location: l.to_location,
      transaction_notes: l.transaction_notes,
      timestamp: l.timestamp,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("Reporting Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch logs." });
  }
};

// --- 2. Get Low Stock ---
exports.getLowStock = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        quantity: { [Op.lte]: sequelize.col("reorder_point") },
      },
      order: [["quantity", "ASC"]],
    });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Low Stock Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch low stock." });
  }
};

// --- 3. Get Location Summary ---
exports.getLocationSummary = async (req, res) => {
  try {
    const summary = await Product.findAll({
      attributes: [
        "location",
        [sequelize.fn("COUNT", sequelize.col("id")), "item_count"],
        [sequelize.fn("SUM", sequelize.col("quantity")), "total_quantity"],
      ],
      group: ["location"],
      order: [["location", "ASC"]],
    });
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error("Summary Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch summary." });
  }
};
