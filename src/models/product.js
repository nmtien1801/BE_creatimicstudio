"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsToMany(models.Category, {
        through: "ProductCategory", // Tên bảng trung gian
        foreignKey: "productId", // Khóa ngoại trỏ đến Product
        otherKey: "categoryId", // Khóa ngoại trỏ đến Category
        as: "category", // Alias khi truy vấn
      });
    }
  }
  Product.init(
    {
      name: DataTypes.STRING,
      image: DataTypes.STRING,
      description: DataTypes.TEXT,
      detail: DataTypes.TEXT,
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
