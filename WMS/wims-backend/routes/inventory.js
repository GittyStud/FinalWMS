const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, inventoryController.getProducts);
router.post(
  "/",
  authenticate,
  authorize(["Admin", "Manager"]),
  inventoryController.createProduct
);
router.put(
  "/:id",
  authenticate,
  authorize(["Admin", "Manager"]),
  inventoryController.updateProduct
);
router.delete(
  "/:id",
  authenticate,
  authorize(["Admin"]),
  inventoryController.deleteProduct
);

module.exports = router;
