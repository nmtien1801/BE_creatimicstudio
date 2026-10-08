"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
      Review.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    }
  }

  Review.init(
    {
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Review",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["productId", "userId"],
        },
      ],
    },
  );

  return Review;
};
