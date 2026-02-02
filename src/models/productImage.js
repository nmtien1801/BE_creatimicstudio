"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProductImage extends Model {
    static associate(models) {
      ProductImage.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
      });
    }
  }
  ProductImage.init(
    {
      productId: DataTypes.INTEGER,
      image: DataTypes.STRING,
      color: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ProductImage",
      tableName: "ProductImage",
    }
  );
  return ProductImage;
};