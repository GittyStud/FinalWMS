const express = require("express");
const router = express.Router();
const reportingController = require("../controllers/reportingController");
const { authenticate, authorize } = require("../middleware/auth");

router.get(
  "/movement",
  authenticate,
  authorize(["Admin", "Manager"]),
  reportingController.getMovementLogs
);
router.get(
  "/lowstock",
  authenticate,
  authorize(["Admin", "Manager"]),
  reportingController.getLowStock
);
router.get(
  "/summary/location",
  authenticate,
  authorize(["Admin", "Manager"]),
  reportingController.getLocationSummary
);

// New Route: System Audit Logs (Admin Only)
router.get(
  "/audit",
  authenticate,
  authorize(["Admin"]),
  reportingController.getSystemAuditLogs
);

module.exports = router;
