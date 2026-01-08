const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sale = sequelize.define("Sale", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  taxAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  discountAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  finalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  cashier: {
    type: DataTypes.STRING, 
    allowNull: false
  }
}, {
  tableName: "sales",
  timestamps: true
});

module.exports = Sale;
