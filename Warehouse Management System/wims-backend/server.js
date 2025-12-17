// server.js
const dotenv = require("dotenv");
// 1. Load environment variables FIRST
dotenv.config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// 2. Import database *after* .env is loaded (if it accessed .env directly)
// We rely on this import to run the connection test defined in db.js
const db = require("./db"); // Import it to trigger the connection test log

// Import routes
const authRoutes = require("./routes/authRoutes"); // Corrected to match your folder structure: authRoutes.js
const inventoryRoutes = require("./routes/inventoryRoutes"); // Corrected
const userRoutes = require("./routes/userRoutes"); // Corrected
const reportsRoutes = require("./routes/reportingRoutes"); // Corrected

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow cross-origin requests from the frontend
app.use(bodyParser.json());

// API Routes (Mounted under /api)
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportsRoutes);

// Simple root route for testing server status
app.get("/", (req, res) => {
  res.status(200).json({ message: "WMS Backend API is running successfully." });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `\n\x1b[32mWMS Backend Server is running on port \x1b[1m${PORT}\x1b[0m\x1b[32m.\x1b[0m`
  );
  console.log(`Access Status: http://localhost:${PORT}/\n`);
});
