const { Product, ProductMovementLog, User, AuditLog } = require("../models");
const sequelize = require("../db");
const { Op } = require("sequelize");

// --- 1. Get Movement Logs (Inventory Changes) ---
exports.getMovementLogs = async (req, res) => {
  try {
    const logs = await ProductMovementLog.findAll({
      include: [
        { model: Product, as: "product", attributes: ["sku", "name"] },
        { model: User, as: "user", attributes: ["username"] },
      ],
      order: [["timestamp", "DESC"]],
    });

    const formatted = logs.map((l) => ({
      id: l.id,
      product_sku: l.product?.sku || "N/A",
      product_name: l.product?.name || "Deleted Product",
      user_name: l.user?.username || "System",
      movement_type: l.movement_type,
      quantity_change: l.quantity_change,
      timestamp: l.timestamp,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch logs." });
  }
};

// --- 2. Get Low Stock ---
exports.getLowStock = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { quantity: { [Op.lte]: sequelize.col("reorder_point") } },
      order: [["quantity", "ASC"]],
    });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
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
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch summary." });
  }
};

// --- 4. Get System Audit Logs (Admin Actions) ---
exports.getSystemAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [{ model: User, as: "user", attributes: ["username", "role"] }],
      order: [["createdAt", "DESC"]],
      limit: 100, // Limit to last 100 actions for performance
    });

    const formatted = logs.map((l) => ({
      id: l.id,
      user_name: l.user?.username || "Unknown",
      role: l.user?.role || "-",
      action: l.action,
      details: l.details,
      ip: l.ip_address,
      timestamp: l.createdAt,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("Audit Log Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch audit logs." });
  }
};
