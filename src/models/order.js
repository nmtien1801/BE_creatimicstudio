"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      Order.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
      });
    }
  }
  Order.init(
    {
      orderId: {
        type: DataTypes.STRING,
        unique: true,
        primaryKey: true,
      },
      userId: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      amount: DataTypes.FLOAT,
      status: {
        type: DataTypes.ENUM("pending", "completed", "failed", "cancelled"),
        defaultValue: "pending",
      },
      paymentMethod: DataTypes.STRING,
      notes: DataTypes.TEXT,
      expiresAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Order",
      timestamps: true,
    },
  );
  return Order;
};
