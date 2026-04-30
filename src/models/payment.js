"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Order, {
        foreignKey: "orderId",
        targetKey: "orderId",
        as: "order",
      });
    }
  }
  Payment.init(
    {
      paymentId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      orderId: {
        type: DataTypes.STRING,
        references: {
          model: "Order",
          key: "orderId",
        },
      },
      transactionId: DataTypes.STRING,
      paymentMethod: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM("pending", "success", "failed", "cancelled"),
        defaultValue: "pending",
      },
      responseCode: DataTypes.STRING,
      responseMessage: DataTypes.TEXT,
      amount: DataTypes.FLOAT,
      paidAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Payment",
      timestamps: true,
    },
  );
  return Payment;
};
