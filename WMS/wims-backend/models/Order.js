const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Order = sequelize.define(
  "Order",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    supplier_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("PENDING", "RECEIVED", "CANCELLED"),
      defaultValue: "PENDING",
    },
    total_cost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    order_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    expected_delivery: { type: DataTypes.DATEONLY },
    notes: { type: DataTypes.TEXT },
  },
  {
    tableName: "orders",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Order;