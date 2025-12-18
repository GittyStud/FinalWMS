const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Supplier = sequelize.define(
  "Supplier",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    contact_person: { type: DataTypes.STRING(100) },
    email: { type: DataTypes.STRING(100), validate: { isEmail: true } },
    phone: { type: DataTypes.STRING(20) },
    address: { type: DataTypes.TEXT },
  },
  {
    tableName: "suppliers",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Supplier;