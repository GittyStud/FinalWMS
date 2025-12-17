// backend/models/index.js (Updated)

const sequelize = require("../db");
const User = require("./User");
const Product = require("./Product");
const AuditLog = require("./AuditLog");

// --- Define Relationships ---

// 1. User and AuditLog (Who performed the action)
User.hasMany(AuditLog, {
  foreignKey: "user_id",
  as: "logs",
});
AuditLog.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// 2. Product and AuditLog (What item was affected)
Product.hasMany(AuditLog, {
  foreignKey: "product_id",
  as: "auditLogs",
});
AuditLog.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// 3. Product's audit trail logic
Product.audit = async function (userId, productId, actionType, details) {
  await AuditLog.create({
    user_id: userId,
    product_id: productId,
    action_type: actionType,
    details: details,
  });
};

// --- Model Definitions (Ensuring all models are exported) ---
module.exports = {
  sequelize,
  User,
  Product,
  AuditLog,
  // Sync function now includes AuditLog and its relationships
  sync: async (force = false) => {
    await sequelize.sync({ force });
  },
};
