const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SaleItem = sequelize.define("SaleItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: "sale_items",
  timestamps: false
});

module.exports = SaleItem;
