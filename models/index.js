const User = require("./User");
const Sale = require("./Sale");
const SaleItem = require("./SaleItem");
const Product = require("./Product");

// User → Sales
User.hasMany(Sale, {
  foreignKey: "cashierId",
  as: "sales",
});

Sale.belongsTo(User, {
  foreignKey: "cashierId",
  as: "cashier",
});

// Sale → SaleItems
Sale.hasMany(SaleItem, {
  foreignKey: "saleId",
  onDelete: "CASCADE",
});

SaleItem.belongsTo(Sale, {
  foreignKey: "saleId",
});

// Product → SaleItems
Product.hasMany(SaleItem, {
  foreignKey: "productId",
});

SaleItem.belongsTo(Product, {
  foreignKey: "productId",
});

module.exports = {
  User,
  Sale,
  SaleItem,
  Product,
};