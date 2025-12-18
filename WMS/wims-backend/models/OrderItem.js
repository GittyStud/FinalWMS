const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unit_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    // Note: 'subtotal' is a generated column in DB, we can just read it or calculate it
  },
  {
    tableName: "order_items",
    timestamps: false,
    underscored: true,
  }
);

module.exports = OrderItem;