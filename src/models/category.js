"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // 1. Một Category con thuộc về một Category cha (BelongsTo)
      Category.belongsTo(models.Category, {
        as: "parent",
        foreignKey: "parentId",
      });

      // 2. Một Category cha có thể có nhiều Category con (HasMany)
      Category.hasMany(models.Category, {
        as: "children",
        foreignKey: "parentId",
      });
    }
  }
  Category.init(
    {
      name: DataTypes.STRING,
      icon: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      // Thêm trường parentId để lưu ID của thư mục cha
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Thư mục cha cao nhất (Root) sẽ có parentId là null
        references: {
          model: "Category",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Category",
    }
  );
  return Category;
};


// const categories = await Category.findAll({
//   where: { parentId: null }, // Lấy các danh mục gốc
//   include: [
//     {
//       model: Category,
//       as: "children",
//       include: ["children"], // Đệ quy nếu muốn lấy thêm cấp cháu
//     },
//   ],
// });