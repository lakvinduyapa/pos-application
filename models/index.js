const Sale = require("./Sale");
const SaleItem = require("./SaleItem");
const Product = require("./Product");

// Relationships
Sale.hasMany(SaleItem, { onDelete: "CASCADE" });
SaleItem.belongsTo(Sale);

Product.hasMany(SaleItem);
SaleItem.belongsTo(Product);

module.exports = { Sale, SaleItem, Product };
