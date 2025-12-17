// backend/routes/inventory.js (Updated with Audit Logging)

const express = require("express");
const { Product, AuditLog } = require("../models");
const { authenticate, authorize } = require("../middleware/auth");
const sequelize = require("../db");

const router = express.Router();

// ... existing GET /inventory route ...
// GET all products (Staff/Manager/Admin)
router.get(
  "/",
  authenticate,
  authorize(["Staff", "Manager", "Admin"]),
  async (req, res) => {
    try {
      const products = await Product.findAll();
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      console.error("Error fetching products:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to retrieve products." });
    }
  }
);

// POST new product (Manager/Admin only)
router.post(
  "/",
  authenticate,
  authorize(["Admin", "Manager"]),
  async (req, res) => {
    const {
      name,
      sku,
      quantity,
      category,
      location,
      reorder_point,
      unit_cost,
      expiration_date,
    } = req.body;
    if (!name || !sku || quantity === undefined || !location) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    try {
      const product = await Product.create({
        name,
        sku,
        quantity,
        category,
        location,
        reorder_point,
        unit_cost,
        expiration_date,
      });

      // --- AUDIT LOGGING: CREATE ---
      await AuditLog.create({
        user_id: req.user.id,
        product_id: product.id,
        action_type: "INVENTORY_CREATE",
        details: `Initial stock: ${quantity} units at ${location}. Cost: $${unit_cost}.`,
      });
      // -----------------------------

      res
        .status(201)
        .json({
          success: true,
          message: "Product added successfully.",
          data: product,
        });
    } catch (error) {
      console.error("Error adding product:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        return res
          .status(409)
          .json({ success: false, message: "SKU already exists." });
      }
      res
        .status(500)
        .json({ success: false, message: "Failed to add product." });
    }
  }
);

// PUT update product (Manager/Admin only)
router.put(
  "/:id",
  authenticate,
  authorize(["Admin", "Manager"]),
  async (req, res) => {
    const { id } = req.params;
    const { transaction_notes, ...updateFields } = req.body; // Separate notes from fields

    // Validate quantity is a non-negative number if present
    if (
      updateFields.quantity !== undefined &&
      (typeof updateFields.quantity !== "number" || updateFields.quantity < 0)
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Quantity must be a non-negative number.",
        });
    }

    let t; // Transaction object
    try {
      t = await sequelize.transaction();

      const product = await Product.findByPk(id, { transaction: t });
      if (!product) {
        await t.rollback();
        return res
          .status(404)
          .json({ success: false, message: "Product not found." });
      }

      // Prepare audit log entry
      let changes = [];
      let logDetails = transaction_notes || "No specific notes provided.";

      for (const key in updateFields) {
        if (
          product[key] !== undefined &&
          String(product[key]) !== String(updateFields[key])
        ) {
          changes.push({
            field: key,
            oldValue: product[key],
            newValue: updateFields[key],
          });
        }
      }

      // Apply changes
      await product.update(updateFields, { transaction: t });

      // --- AUDIT LOGGING: UPDATE ---
      if (changes.length > 0) {
        const changeSummary = changes
          .map((c) => `${c.field}: ${c.oldValue} -> ${c.newValue}`)
          .join(", ");

        await AuditLog.create(
          {
            user_id: req.user.id,
            product_id: product.id,
            action_type: "INVENTORY_UPDATE",
            details: `Changes: ${changeSummary}. Notes: ${logDetails}`,
          },
          { transaction: t }
        );
      }
      // -----------------------------

      await t.commit();
      res
        .status(200)
        .json({ success: true, message: "Product updated successfully." });
    } catch (error) {
      if (t) await t.rollback();
      console.error("Error updating product:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update product." });
    }
  }
);

// DELETE product (Admin only)
router.delete("/:id", authenticate, authorize(["Admin"]), async (req, res) => {
  const { id } = req.params;
  let t; // Transaction object
  try {
    t = await sequelize.transaction();

    const product = await Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    const productName = product.name;

    await product.destroy({ transaction: t });

    // --- AUDIT LOGGING: DELETE ---
    await AuditLog.create(
      {
        user_id: req.user.id,
        // product_id is intentionally left NULL or referencing a deleted ID, but we track the name.
        action_type: "INVENTORY_DELETE",
        details: `Deleted product: ${productName} (SKU: ${product.sku}).`,
      },
      { transaction: t }
    );
    // -----------------------------

    await t.commit();
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    if (t) await t.rollback();
    console.error("Error deleting product:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete product." });
  }
});

module.exports = router;
