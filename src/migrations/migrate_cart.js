module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("CartItem", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "User", key: "id" },
        onDelete: "CASCADE",
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Product", key: "id" },
        onDelete: "CASCADE",
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addConstraint("CartItem", {
      fields: ["userId", "productId"],
      type: "unique",
      name: "cart_item_user_product_unique",
    });
  },
  down: async (queryInterface) => queryInterface.dropTable("CartItem"),
};

// npx sequelize-cli db:migrate --to migrate_cart.js