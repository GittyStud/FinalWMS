require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./db");

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// --- 1. GLOBAL MIDDLEWARE ---
app.use(cors());
// This MUST come before routes to prevent the "parameters: undefined" error
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. ROUTES ---
// Mounts everything via routes/index.js
app.use("/api", require("./routes/index"));

app.get("/", (req, res) => {
  res.status(200).json({ message: "WIMS API is running." });
});

// --- 3. SYNC & START ---
sequelize
  .sync({ alter: false })
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `\x1b[32m🚀 WMS Server running on http://localhost:${PORT}\x1b[0m`
      );
    });
  })
  .catch((err) => console.error("Database Sync Error:", err));
