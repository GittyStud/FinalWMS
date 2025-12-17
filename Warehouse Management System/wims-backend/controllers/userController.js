const pool = require("../db");
const bcrypt = require("bcrypt");

// --- READ: Fetch All Users (GET /api/users) ---
const getUsers = async (req, res) => {
  try {
    // FIX: Removed 'full_name' and 'is_active'. Added 'email' and 'updated_at'.
    const [users] = await pool.query(
      "SELECT id, username, email, role, created_at, updated_at FROM users"
    );

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    // NOTE: This part is firing the SQL error.
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve user data." });
  }
};

// --- CREATE: Add a New User (POST /api/users) ---
const createUser = async (req, res) => {
  // FIX: Using 'email' instead of 'full_name' if that's the field used
  const { username, password, role, email } = req.body;

  if (!username || !password || !role || !email) {
    // Email should be required
    return res.status(400).json({
      success: false,
      message: "Missing required fields: username, password, role, and email.",
    });
  }

  try {
    // Hash the password securely before storing
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const sql = `
             INSERT INTO users 
             (username, password_hash, role, email) 
             VALUES (?, ?, ?, ?)
         `;
    const [result] = await pool.query(sql, [
      username,
      passwordHash,
      role,
      email,
    ]);

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: `User with username '${username}' already exists.`,
      });
    }
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create new user." });
  }
};

// --- UPDATE: Modify User Details (PUT /api/users/:id) ---
const updateUser = async (req, res) => {
  const userId = req.params.id;
  // FIX: Using 'email' instead of 'full_name' and removing 'is_active'
  const { password, role, email } = req.body;

  if (!role || !email) {
    // Only require role and email for update
    return res.status(400).json({
      success: false,
      message: "Missing required fields: role and email.",
    });
  }

  try {
    let updateFields = [role, email, userId];
    let updateSql = `
             UPDATE users 
             SET role=?, email=?
             WHERE id=?
         `;

    // Check if password needs to be updated
    if (password) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      updateSql = `
                 UPDATE users 
                 SET password_hash=?, role=?, email=?
                 WHERE id=?
             `;
      // Reorder fields to match the new SQL placeholders
      updateFields = [passwordHash, role, email, userId];
    }

    const [result] = await pool.query(updateSql, updateFields);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or no changes made.",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "User updated successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: `Update failed: Username already exists.`,
      });
    }
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Failed to update user." });
  }
};

// --- DELETE: Remove User (DELETE /api/users/:id) ---
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // IMPORTANT: Assuming 'req.user' is populated by your authentication middleware
    if (!req.user || req.user.id == userId) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete the currently logged-in account.",
      });
    }

    // Delete the user record
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or already deleted.",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "User successfully deleted." });
  } catch (error) {
    // Check for foreign key constraint errors if user has existing audit logs, etc.
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Failed to delete user." });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
