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
      Product.hasMany(models.ProductImage, {
        foreignKey: "productId",
        as: "images",
      });
      Product.hasMany(models.OrderItem, {
        foreignKey: "productId",
        as: "orderItems",
      });
      Product.hasMany(models.Review, {
        foreignKey: "productId",
        as: "reviews",
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
      sold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isTopSeller: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      maSP: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Product",
    },
  );
  return Product;
};
