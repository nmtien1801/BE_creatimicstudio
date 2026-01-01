"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Category", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      icon: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.BOOLEAN,
      },
      // Thêm cột parentId để quản lý cấp bậc
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true, // Danh mục gốc sẽ có parentId = null
        references: {
          model: "Categories", // Tham chiếu đến chính bảng này
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL", // Khi xóa cha, con sẽ thành danh mục gốc (hoặc có thể dùng CASCADE)
      },
      
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Category");
  },
};

// npx sequelize-cli db:migrate --to migrate_users.js
