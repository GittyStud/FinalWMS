const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const inventoryRoutes = require("./inventory");
const reportRoutes = require("./reports");
const userRoutes = require("./users");
const supplierRoutes = require("./suppliers"); // New
const orderRoutes = require("./orders"); // New

router.use("/auth", authRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/reports", reportRoutes);
router.use("/users", userRoutes);
router.use("/suppliers", supplierRoutes); // New
router.use("/orders", orderRoutes); // New

module.exports = router;
