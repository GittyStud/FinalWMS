const jwt = require("jsonwebtoken");
const pool = require("../db"); // Import database connection pool
const bcrypt = require("bcrypt"); // Using 'bcrypt' for hashing and comparison

// --- Helper function to generate JWT ---
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
};

// =========================================================================
// 1. REGISTER: Handles POST /api/auth/register
// =========================================================================
exports.register = async (req, res) => {
  // Note: In a professional WMS, this route should ideally be protected
  // and handled by an Admin-level user via userController.js.
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both username and password.",
    });
  }

  try {
    // 1. Check if user already exists
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with that username already exists.",
      });
    }

    // 2. Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Define the role (default to Staff if not provided or invalid)
    // Ensure the role matches the ENUM in your SQL schema: 'Admin', 'Manager', 'Staff'
    const allowedRoles = ["Admin", "Manager", "Staff"];
    const userRole = role && allowedRoles.includes(role) ? role : "Staff";

    // 4. Insert new user into the database
    const [result] = await pool.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, userRole]
    );

    // 5. Respond with success
    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Database error during registration:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration process.",
    });
  }
};

// =========================================================================
// 2. LOGIN: Handles POST /api/auth/login
// =========================================================================
exports.login = async (req, res) => {
  const { username, password } = req.body;

  // Input validation: Check for missing credentials
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both username and password.",
    });
  }

  try {
    // 1. Find user by username and check if they are active
    const [users] = await pool.query(
      // Fetches the stored HASHED password
      "SELECT id, username, password, role, is_active FROM users WHERE username = ? AND is_active = 1",
      [username]
    );

    const user = users[0];

    // 2. Check if user exists (and is active)
    if (!user) {
      // Generic message to prevent user enumeration attacks
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password." });
    }

    // 3. SECURE Password check: Compare the submitted password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password." });
    }

    // 4. User is authenticated, generate JWT
    const token = generateToken(user);

    // Filter user data to send to frontend (do not send password hash)
    const userData = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    // 5. Send successful response
    res.status(200).json({
      success: true,
      message: "Login successful.",
      user: userData,
      token: token,
    });
  } catch (error) {
    console.error("Database error during login:", error);
    res.status(500).json({
      success: false,
      message:
        "Server error during login process. Check database connection and configuration.",
    });
  }
};
