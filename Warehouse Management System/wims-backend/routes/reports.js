// backend/routes/reports.js (New File)

const express = require("express");
const { Product, AuditLog, User } = require("../models");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Get Low Stock Report (Manager/Admin only)
router.get(
  "/lowstock",
  authenticate,
  authorize(["Admin", "Manager"]),
  async (req, res) => {
    try {
      const lowStockProducts = await Product.findAll({
        where: sequelize.literal("quantity <= reorder_point"),
        attributes: [
          "id",
          "name",
          "sku",
          "quantity",
          "reorder_point",
          "location",
          "category",
        ],
        order: [["quantity", "ASC"]],
      });

      res.status(200).json({ success: true, data: lowStockProducts });
    } catch (error) {
      console.error("Error fetching low stock report:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to retrieve low stock report.",
        });
    }
  }
);

// Get Audit Log (Manager/Admin only)
router.get(
  "/auditlog",
  authenticate,
  authorize(["Admin", "Manager"]),
  async (req, res) => {
    try {
      const logs = await AuditLog.findAll({
        attributes: ["id", "action_type", "details", "timestamp"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["username"],
          },
          {
            model: Product,
            as: "product",
            attributes: ["sku"],
          },
        ],
        order: [["timestamp", "DESC"]],
        limit: 100, // Limit results for performance
      });

      // Format the output to flatten user/product info
      const formattedLogs = logs.map((log) => ({
        id: log.id,
        timestamp: log.timestamp,
        user_username: log.user.username,
        action_type: log.action_type,
        details: log.details,
        product_sku: log.product ? log.product.sku : "N/A",
      }));

      res.status(200).json({ success: true, data: formattedLogs });
    } catch (error) {
      console.error("Error fetching audit log:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to retrieve audit log." });
    }
  }
);

module.exports = router;
