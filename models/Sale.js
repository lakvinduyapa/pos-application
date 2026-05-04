const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sale = sequelize.define("Sale", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  finalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  paymentMethod: {
    type: DataTypes.ENUM("CASH", "CARD", "ONLINE", "SPLIT"),
    defaultValue: "CASH",
  },

  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  changeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  paymentStatus: {
    type: DataTypes.ENUM("PAID", "PENDING", "PARTIAL"),
    defaultValue: "PAID",
  },

  cashierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

}, {
  tableName: "sales",
  timestamps: true,
});

module.exports = Sale;