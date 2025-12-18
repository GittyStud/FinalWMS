const User = require("./User");
const Product = require("./Product");
const ProductMovementLog = require("./ProductMovementLog");
const AuditLog = require("./AuditLog");
const Supplier = require("./Supplier");
const Order = require("./Order");
const OrderItem = require("./OrderItem");

// --- Existing Associations ---
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

Product.hasMany(AuditLog, { foreignKey: "product_id", as: "auditLogs" });
AuditLog.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// --- New Supplier/Order Associations ---

// Supplier <-> Order
Supplier.hasMany(Order, { foreignKey: "supplier_id", as: "orders" });
Order.belongsTo(Supplier, { foreignKey: "supplier_id", as: "supplier" });

// User <-> Order (Creator)
User.hasMany(Order, { foreignKey: "user_id", as: "createdOrders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "creator" });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// Product <-> OrderItem
Product.hasMany(OrderItem, { foreignKey: "product_id", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

module.exports = {
  User,
  Product,
  ProductMovementLog,
  AuditLog,
  Supplier,
  Order,
  OrderItem,
};
