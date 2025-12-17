const pool = require("../db");

// --- READ: Fetch All Products (GET /api/inventory) ---
const getProducts = async (req, res) => {
  try {
    // Query all fields needed for the inventory table
    const [products] = await pool.query(
      `SELECT id, name, sku, quantity, category, location, reorder_point, unit_cost, expiration_date
             FROM products 
             ORDER BY id DESC`
    );

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve inventory data." });
  }
};

// --- CREATE: Add a New Product (POST /api/inventory) ---
const createProduct = async (req, res) => {
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

  // Basic validation
  if (!name || !sku || quantity === undefined || !location) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "Missing required product fields (name, sku, quantity, location).",
      });
  }

  try {
    // --- 1. Insert Product ---
    const sql = `
            INSERT INTO products 
            (name, sku, quantity, category, location, reorder_point, unit_cost, expiration_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
    const [result] = await pool.query(sql, [
      name,
      sku,
      quantity,
      category,
      location,
      reorder_point || 50,
      unit_cost || null,
      expiration_date || null,
    ]);

    // --- 2. Log the movement (Initial Stock Receipt) ---
    const userId = req.user.id;

    const logSql = `
            INSERT INTO product_movement_log 
            (product_id, user_id, movement_type, quantity_change, to_location, transaction_notes)
            VALUES (?, ?, 'RECEIPT', ?, ?, 'Initial stock receipt (Product added).')
        `;
    await pool.query(logSql, [result.insertId, userId, quantity, location]);

    res.status(201).json({
      success: true,
      message: "Product added and stock logged successfully.",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({
          success: false,
          message: `Product with SKU '${sku}' already exists.`,
        });
    }
    console.error("Error creating product:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add new product." });
  }
};

// --- UPDATE: Modify Product Details and Quantity (PUT /api/inventory/:id) ---
const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const {
    name,
    sku,
    quantity,
    category,
    location,
    reorder_point,
    unit_cost,
    expiration_date,
    transaction_notes,
  } = req.body;

  // User ID from JWT for logging
  const userId = req.user.id;

  // Start a database transaction for data integrity (either all queries succeed or all fail)
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Fetch current product data for comparison
    const [currentProducts] = await connection.query(
      "SELECT quantity, location FROM products WHERE id = ?",
      [productId]
    );

    if (currentProducts.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    const currentProduct = currentProducts[0];
    const oldQuantity = currentProduct.quantity;
    const oldLocation = currentProduct.location;

    // 2. Update the main products table
    const updateSql = `
            UPDATE products 
            SET name=?, sku=?, quantity=?, category=?, location=?, 
                reorder_point=?, unit_cost=?, expiration_date=?
            WHERE id=?
        `;
    const [updateResult] = await connection.query(updateSql, [
      name,
      sku,
      quantity,
      category,
      location,
      reorder_point,
      unit_cost,
      expiration_date,
      productId,
    ]);

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({
          success: false,
          message: "Product update failed or no changes made.",
        });
    }

    // 3. Log movement if quantity or location changed
    const quantityChange = quantity - oldQuantity;
    const locationChange = location !== oldLocation;

    if (quantityChange !== 0 || locationChange) {
      let movementType = "ADJUSTMENT"; // Default for simple quantity change
      let notes = transaction_notes || "Inventory details updated.";

      if (quantityChange > 0) {
        movementType = "RECEIPT"; // Quantity increased
        notes = transaction_notes || "Stock manually adjusted (IN).";
      } else if (quantityChange < 0) {
        movementType = "DISPATCH"; // Quantity decreased (Manual OUT)
        notes = transaction_notes || "Stock manually adjusted (OUT).";
      }

      if (locationChange && quantityChange === 0) {
        movementType = "MOVE"; // Only location changed
        notes =
          transaction_notes ||
          `Product moved from ${oldLocation} to ${location}.`;
      } else if (locationChange && quantityChange !== 0) {
        // Location and quantity changed: prioritize quantity change for logging,
        // and note the location change in the description.
        notes =
          transaction_notes ||
          `Stock adjusted and location updated from ${oldLocation} to ${location}.`;
      }

      const logSql = `
                INSERT INTO product_movement_log 
                (product_id, user_id, movement_type, quantity_change, from_location, to_location, transaction_notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
      await connection.query(logSql, [
        productId,
        userId,
        movementType,
        quantityChange,
        oldLocation,
        location,
        notes,
      ]);
    }

    await connection.commit();
    res
      .status(200)
      .json({ success: true, message: "Product updated successfully." });
  } catch (error) {
    await connection.rollback();
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({
          success: false,
          message: `Update failed: SKU '${sku}' already exists.`,
        });
    }
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update product." });
  } finally {
    connection.release(); // Release the connection back to the pool
  }
};

// --- DELETE: Remove Product (DELETE /api/inventory/:id) ---
const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    // The movement log has a Foreign Key constraint:
    // We must ensure that the product is not associated with any existing logs
    // or prevent deletion if any logs exist (ON DELETE RESTRICT).
    // For simplicity here, we assume ON DELETE CASCADE or the product won't have logs yet.
    // If the database uses RESTRICT, we will get an error here.
    // In a real WMS, you usually mark a product as inactive, rather than deleting it.

    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [
      productId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Product not found or already deleted.",
        });
    }

    res
      .status(200)
      .json({ success: true, message: "Product successfully deleted." });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete product: Historical movement data exists for this item. Consider marking it inactive instead.",
      });
    }
    console.error("Error deleting product:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete product." });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct, // Export the new function
  deleteProduct, // Export the new function
};
