const pool = require("../db");

// --- 1. Get Full Movement Log (GET /api/reports/movement) ---
const getMovementLog = async (req, res) => {
  try {
    // SQL JOIN to retrieve readable user and product names along with log details
    const [logs] = await pool.query(`
            SELECT 
                l.id,
                p.sku AS product_sku,
                p.name AS product_name,
                u.username AS user_name,
                l.movement_type,
                l.quantity_change,
                l.from_location,
                l.to_location,
                l.transaction_notes,
                l.timestamp
            FROM product_movement_log l
            JOIN products p ON l.product_id = p.id
            JOIN users u ON l.user_id = u.id
            ORDER BY l.timestamp DESC
        `);

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching movement log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve product movement log data.",
    });
  }
};

// --- 2. Get Low Stock Report (GET /api/reports/lowstock) ---
const getLowStockReport = async (req, res) => {
  try {
    // Query products where current quantity is less than the reorder_point
    const [lowStockProducts] = await pool.query(`
            SELECT 
                id,
                name,
                sku,
                quantity,
                reorder_point,
                location
            FROM products
            WHERE quantity <= reorder_point
            ORDER BY quantity ASC
        `);

    res.status(200).json({ success: true, data: lowStockProducts });
  } catch (error) {
    console.error("Error fetching low stock report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate low stock report.",
    });
  }
};

// --- 3. Get Stock Summary by Location (GET /api/reports/summary/location) ---
const getSummaryByLocation = async (req, res) => {
  try {
    // Group and sum the total quantity and count of items by storage location
    const [summary] = await pool.query(`
            SELECT
                location,
                COUNT(id) AS item_count,
                SUM(quantity) AS total_quantity
            FROM products
            GROUP BY location
            ORDER BY location ASC
        `);

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error("Error fetching location summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate stock summary by location.",
    });
  }
};

module.exports = {
  getMovementLog,
  getLowStockReport,
  getSummaryByLocation,
};
