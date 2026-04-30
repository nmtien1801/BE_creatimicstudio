// Migration to create Order and Payment tables
// Run: npm run migrate

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Order table
    await queryInterface.createTable("Order", {
      orderId: {
        type: Sequelize.STRING,
        primaryKey: true,
        unique: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "User",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      productId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Product",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "completed", "failed", "cancelled"),
        defaultValue: "pending",
      },
      paymentMethod: {
        type: Sequelize.STRING,
      },
      notes: {
        type: Sequelize.TEXT,
      },
      expiresAt: {
        type: Sequelize.DATE,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create Payment table
    await queryInterface.createTable("Payment", {
      paymentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      orderId: {
        type: Sequelize.STRING,
        references: {
          model: "Order",
          key: "orderId",
        },
        onDelete: "CASCADE",
      },
      transactionId: {
        type: Sequelize.STRING,
      },
      paymentMethod: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM("pending", "success", "failed", "cancelled"),
        defaultValue: "pending",
      },
      responseCode: {
        type: Sequelize.STRING,
      },
      responseMessage: {
        type: Sequelize.TEXT,
      },
      amount: {
        type: Sequelize.FLOAT,
      },
      paidAt: {
        type: Sequelize.DATE,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create index for faster queries
    await queryInterface.addIndex("Order", ["userId"]);
    await queryInterface.addIndex("Order", ["productId"]);
    await queryInterface.addIndex("Payment", ["orderId"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Payment");
    await queryInterface.dropTable("Order");
  },
};
