"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Tạo bảng Order (Đơn hàng tổng)
    await queryInterface.createTable("Order", {
      orderId: {
        type: Sequelize.STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true, // Cho phép khách vãng lai hoặc xóa user không mất đơn
        references: {
          model: "User",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      totalAmount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      paymentMethod: {
        type: Sequelize.STRING, // 'cod' | 'bank'
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "completed", "cancelled"),
        defaultValue: "pending",
        allowNull: false,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 2. Tạo bảng OrderItem (Chi tiết từng món trong đơn)
    await queryInterface.createTable("OrderItem", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      orderId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Order",
          key: "orderId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // Xóa Order sẽ tự động xóa các OrderItem liên quan
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Product",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 3. Đánh index để tăng tốc độ truy vấn lịch sử & chi tiết đơn
    await queryInterface.addIndex("Order", ["userId"]);
    await queryInterface.addIndex("OrderItem", ["orderId"]);
    await queryInterface.addIndex("OrderItem", ["productId"]);
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa bảng OrderItem trước (do đang giữ khóa ngoại tới Order)
    await queryInterface.dropTable("OrderItem");
    await queryInterface.dropTable("Order");

    // Xóa kiểu ENUM của cột status trên PostgreSQL (nếu sử dụng Postgres)
    if (queryInterface.sequelize.options.dialect === "postgres") {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_Order_status";',
      );
    }
  },
};

// npx sequelize-cli db:migrate --to migrate_order-and-orderitem.js