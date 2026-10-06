"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      Order.hasMany(models.OrderItem, { foreignKey: "orderId", as: "items" });
      Order.hasMany(models.Payment, { foreignKey: "orderId", as: "payments" });
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
      fullName: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.STRING,
      notes: DataTypes.TEXT,
      totalAmount: DataTypes.FLOAT,
      paymentMethod: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM("pending", "completed", "cancelled"),
        defaultValue: "pending",
      },
      expiresAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Order",
      timestamps: true,
    }
  );

  return Order;
};