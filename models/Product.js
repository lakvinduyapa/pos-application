const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  discount: {
    type: DataTypes.FLOAT, // percentage
    defaultValue: 0,
  },
  tax: {
    type: DataTypes.FLOAT, // percentage
    defaultValue: 0,
  },
}, {
  tableName: "products",
  timestamps: true,
});

module.exports = Product;
