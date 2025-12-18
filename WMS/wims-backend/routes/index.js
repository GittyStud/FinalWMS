const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const inventoryRoutes = require("./inventory");
const reportRoutes = require("./reports");
const userRoutes = require("./users");

router.use("/auth", authRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/reports", reportRoutes);
router.use("/users", userRoutes);

module.exports = router;
