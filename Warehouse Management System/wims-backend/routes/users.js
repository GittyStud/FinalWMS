// backend/routes/users.js (New File)

const express = require("express");
const { User, AuditLog } = require("../models");
const { authenticate, authorize } = require("../middleware/auth");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Get all users (Admin only)
router.get("/", authenticate, authorize(["Admin"]), async (req, res) => {
  try {
    const users = await User.findAll({
      // THIS is where the attributes list is defined in the correct code:
      attributes: ["id", "username", "email", "role", "createdAt", "updatedAt"],
    });
    // ... rest of the code
  } catch (error) {
    // ...
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve users." });
  }
});

// Create a new user (Admin only)
router.post("/", authenticate, authorize(["Admin"]), async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: username, password, role.",
    });
  }
  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "Staff",
    });

    await AuditLog.create({
      user_id: req.user.id,
      action_type: "USER_CREATE",
      details: `Created new user: ${username} with role ${role}.`,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "Failed to create user." });
  }
});

// Update a user (Admin only)
router.put("/:id", authenticate, authorize(["Admin"]), async (req, res) => {
  const userIdToUpdate = req.params.id;
  const { email, password, role } = req.body;

  // Prevent admin from editing their own account via this route
  if (String(userIdToUpdate) === String(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: "Cannot update your own account via this management panel.",
    });
  }

  try {
    const user = await User.findByPk(userIdToUpdate);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    let updateData = {};
    let auditDetails = `Updated user ${user.username}: `;

    if (email !== undefined) {
      updateData.email = email;
      auditDetails += `email changed to ${email}, `;
    }
    if (role !== undefined) {
      updateData.role = role;
      auditDetails += `role changed to ${role}, `;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
      auditDetails += `password reset, `;
    }

    await user.update(updateData);

    await AuditLog.create({
      user_id: req.user.id,
      action_type: "USER_UPDATE",
      details: auditDetails.slice(0, -2), // Remove trailing comma and space
    });

    res
      .status(200)
      .json({ success: true, message: "User updated successfully." });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Failed to update user." });
  }
});

// Delete a user (Admin only)
router.delete("/:id", authenticate, authorize(["Admin"]), async (req, res) => {
  const userIdToDelete = req.params.id;

  // Prevent admin from deleting their own account
  if (String(userIdToDelete) === String(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: "Cannot delete your own active account.",
    });
  }

  try {
    const user = await User.findByPk(userIdToDelete);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const username = user.username;
    await user.destroy();

    await AuditLog.create({
      user_id: req.user.id,
      action_type: "USER_DELETE",
      details: `Deleted user: ${username} (ID: ${userIdToDelete}).`,
    });

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Failed to delete user." });
  }
});

module.exports = router;
