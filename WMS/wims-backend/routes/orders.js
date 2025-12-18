const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, orderController.getAllOrders);
router.get("/:id", authenticate, orderController.getOrderDetails);
router.post(
  "/",
  authenticate,
  authorize(["Admin", "Manager"]),
  orderController.createOrder
);
router.post(
  "/:id/receive",
  authenticate,
  authorize(["Admin", "Manager"]),
  orderController.receiveOrder
);

module.exports = router;
