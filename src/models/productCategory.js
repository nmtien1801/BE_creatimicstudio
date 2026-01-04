"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductCategory extends Model {
    static associate(models) {}
  }
  ProductCategory.init(
    {
      productId: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Kết hợp với categoryId tạo thành Composite Primary Key
        references: {
          model: "Products",
          key: "id",
        },
      },
      categoryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "Categories",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "ProductCategory",
      tableName: "ProductCategory", // Đảm bảo tên bảng khớp với migration
      timestamps: true,
    }
  );
  return ProductCategory;
};
