"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ProductCategory", {
      productId: {
        type: Sequelize.INTEGER,
        references: { model: "Product", key: "id" },
        onDelete: "CASCADE",
        primaryKey: true,
      },
      categoryId: {
        type: Sequelize.INTEGER,
        references: { model: "Category", key: "id" },
        onDelete: "CASCADE",
        primaryKey: true,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("ProductCategory");
  },
};
