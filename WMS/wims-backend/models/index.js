const User = require("./User");
const Product = require("./Product");
const ProductMovementLog = require("./ProductMovementLog");
const AuditLog = require("./AuditLog");

// --- Associations ---
Product.hasMany(ProductMovementLog, {
  foreignKey: "product_id",
  as: "movements",
});
ProductMovementLog.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

User.hasMany(ProductMovementLog, { foreignKey: "user_id", as: "movements" });
ProductMovementLog.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(AuditLog, { foreignKey: "user_id", as: "auditLogs" });
AuditLog.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Product <-> Audit Logs
Product.hasMany(AuditLog, { foreignKey: "product_id", as: "auditLogs" });
AuditLog.belongsTo(Product, { foreignKey: "product_id", as: "product" });

module.exports = { User, Product, ProductMovementLog, AuditLog };
