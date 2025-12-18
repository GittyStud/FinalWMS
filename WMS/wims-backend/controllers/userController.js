const { User, AuditLog } = require("../models");
const bcrypt = require("bcryptjs");
const sequelize = require("../db");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["created_at", "DESC"]],
    });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ success: false, message: "Error fetching users." });
  }
};

exports.createUser = async (req, res) => {
  // 1. Validate Input Presence
  const { first_name, last_name, email, username, password, role } = req.body;

  if (!username || !email || !password || !first_name || !last_name) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  const transaction = await sequelize.transaction();
  try {
    // 2. Check Duplicates
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      await transaction.rollback();
      return res
        .status(409)
        .json({ success: false, message: "Username already exists." });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      await transaction.rollback();
      return res
        .status(409)
        .json({ success: false, message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create(
      {
        first_name,
        last_name,
        email,
        username,
        password: hashedPassword,
        role,
      },
      { transaction }
    );

    await AuditLog.create(
      {
        user_id: req.user.id,
        action: "CREATE_USER",
        details: `Created user ${username} (${role})`,
        ip_address: req.ip,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    await transaction.rollback();

    // 3. Handle Sequelize Validation Errors (like invalid email)
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((e) => e.message).join(", ");
      return res.status(400).json({ success: false, message: messages });
    }

    console.error("Create User Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.updateUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { first_name, last_name, email, role, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const updates = { first_name, last_name, email, role };
    if (password) updates.password = await bcrypt.hash(password, 10);

    await user.update(updates, { transaction });

    await AuditLog.create(
      {
        user_id: req.user.id,
        action: "UPDATE_USER",
        details: `Updated user ID ${id} (${user.username})`,
        ip_address: req.ip,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json({ success: true, message: "User updated." });
  } catch (error) {
    await transaction.rollback();
    if (error.name === "SequelizeValidationError") {
      return res
        .status(400)
        .json({
          success: false,
          message: error.errors.map((e) => e.message).join(", "),
        });
    }
    res.status(500).json({ success: false, message: "Update failed." });
  }
};

exports.deleteUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    await User.destroy({ where: { id }, transaction });
    await transaction.commit();
    res.status(200).json({ success: true, message: "User deleted." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: "Delete failed." });
  }
};
