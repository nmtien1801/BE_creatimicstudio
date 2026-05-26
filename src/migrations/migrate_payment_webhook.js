module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create payment_webhooks table (Idempotency - Chống trùng lặp đơn)
    await queryInterface.createTable("payment_webhooks", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      webhook_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: "Unique webhook ID từ Sepay - avoid duplicate",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // 2. Create webhook_logs table (Audit Trail - Nhật ký theo dõi lỗi)
    await queryInterface.createTable("webhook_logs", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      webhook_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "Type: sepay, momo, vietqr",
      },
      transaction_id: {
        type: Sequelize.STRING(255),
        comment: "Transaction ID từ provider",
      },
      data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Raw webhook data",
      },
      status: {
        type: Sequelize.ENUM("pending", "success", "error"),
        defaultValue: "pending",
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Error message nếu có",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // 3. Create Indexes for Webhook Tables
    await queryInterface.addIndex("payment_webhooks", ["webhook_id"]);
    await queryInterface.addIndex("webhook_logs", ["webhook_type", "created_at"]);
    await queryInterface.addIndex("webhook_logs", ["transaction_id"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("webhook_logs");
    await queryInterface.dropTable("payment_webhooks");
  },
};