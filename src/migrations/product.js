"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {}
  }
  Product.init(
    {
      name: DataTypes.STRING,
      image: DataTypes.STRING,
      detail: DataTypes.TEXT,
      description: DataTypes.TEXT,
      price: DataTypes.FLOAT,
      status: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Product",
    }
  );
  return Product;
};
