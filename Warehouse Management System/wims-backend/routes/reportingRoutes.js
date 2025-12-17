const express = require("express");
const reportingController = require("../controllers/reportingController");
const { protect, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

// All reporting routes require Manager or Admin access

// GET /api/reports/movement: Detailed historical log of all inventory transactions
router.get(
  "/movement",
  protect,
  authorize(["Admin", "Manager"]),
  reportingController.getMovementLog
);

// GET /api/reports/lowstock: Report on products needing reorder
router.get(
  "/lowstock",
  protect,
  authorize(["Admin", "Manager", "Staff"]), // Staff often need this view
  reportingController.getLowStockReport
);

// GET /api/reports/summary/location: Grouped stock summary
router.get(
  "/summary/location",
  protect,
  authorize(["Admin", "Manager"]),
  reportingController.getSummaryByLocation
);

module.exports = router;
