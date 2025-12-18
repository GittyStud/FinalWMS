const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, supplierController.getAllSuppliers);
router.post("/", authenticate, authorize(["Admin", "Manager"]), supplierController.createSupplier);
router.put("/:id", authenticate, authorize(["Admin", "Manager"]), supplierController.updateSupplier);
router.delete("/:id", authenticate, authorize(["Admin"]), supplierController.deleteSupplier);

module.exports = router;