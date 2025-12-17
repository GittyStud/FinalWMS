const express = require("express");
const inventoryController = require("../controllers/inventoryController");
const { protect, authorize } = require("../middleware/authMiddleware"); // Import middleware
const router = express.Router();

// All routes below this line require authentication (`protect`)

// Route to fetch all products (READ - Available to all roles: Manager, Staff)
router.get("/", protect, inventoryController.getProducts);

// Route to add a new product (CREATE - Only available to Manager/Admin)
router.post(
  "/",
  protect,
  authorize(["Admin", "Manager"]),
  inventoryController.createProduct
);

// Route to update a specific product by ID (UPDATE - Only available to Manager/Admin)
// This calls the updateProduct function you selected in the Canvas.
router.put(
  "/:id",
  protect,
  authorize(["Admin", "Manager"]),
  inventoryController.updateProduct
);

// Route to delete a specific product by ID (DELETE - Highly restricted to Admin)
// This calls the deleteProduct function you selected in the Canvas.
router.delete(
  "/:id",
  protect,
  authorize(["Admin"]),
  inventoryController.deleteProduct
);

module.exports = router;
