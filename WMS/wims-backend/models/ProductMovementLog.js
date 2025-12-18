const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const ProductMovementLog = sequelize.define(
  "ProductMovementLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    movement_type: {
      // UPDATED: Added "IN" and "OUT" to match Controller logic
      type: DataTypes.ENUM(
        "IN",
        "OUT",
        "ADJUSTMENT",
        "RECEIPT",
        "DISPATCH",
        "MOVE"
      ),
      allowNull: false,
    },
    quantity_change: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    from_location: { type: DataTypes.STRING(100) },
    to_location: { type: DataTypes.STRING(100) },
    transaction_notes: { type: DataTypes.TEXT },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "product_movement_log",
    timestamps: false,
    underscored: true,
  }
);

module.exports = ProductMovementLog;
