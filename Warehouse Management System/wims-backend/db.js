const mysql = require("mysql2/promise");
// We need to ensure dotenv is loaded if db.js is run directly,
// but server.js already handles it, so we rely on server.js to load it first.

// --- Configuration for the database connection ---
// We use process.env to read values from the .env file
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "wms_db", // Now uses the .env value (wms_db)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Note: XAMPP typically runs MySQL on port 3306.
};

// Create the connection pool
const pool = mysql.createPool(dbConfig);

// Test the connection on startup
pool
  .getConnection()
  .then((connection) => {
    console.log(
      "\n\x1b[36mDatabase connection successful! Pool created.\x1b[0m"
    );
    connection.release();
  })
  .catch((err) => {
    console.error(
      "\n\x1b[31mFATAL: Database connection failed. Check XAMPP/MySQL status and credentials.\x1b[0m"
    );
    console.error(
      `Attempted DB: ${dbConfig.database} | Host: ${dbConfig.host} | User: ${dbConfig.user}`
    );
    console.error("Error details:", err.message);
    // It's a good practice to exit the process if the database connection fails,
    // as the application cannot run without it.
    // process.exit(1);
  });

module.exports = pool;
