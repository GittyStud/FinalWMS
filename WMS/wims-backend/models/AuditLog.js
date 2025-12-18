const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    details: { type: DataTypes.TEXT },
    ip_address: { type: DataTypes.STRING(50) },
  },
  {
    tableName: "audit_logs",
    timestamps: true,
  }
);

module.exports = AuditLog;
