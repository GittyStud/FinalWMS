const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: { type: DataTypes.TEXT },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    reorder_point: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    location: { type: DataTypes.STRING(100) },
    // Preserved these from your uploaded files
    unit_cost: { type: DataTypes.DECIMAL(10, 2) },
    category: { type: DataTypes.STRING(50) },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

module.exports = Product;
