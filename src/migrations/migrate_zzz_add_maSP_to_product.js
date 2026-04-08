"use strict";
module.exports = {
   up: async (queryInterface, Sequelize) => {
     await queryInterface.addColumn('Product', 'maSP', {
      type: Sequelize.STRING,
      allowNull: true, // Có thể để null ban đầu
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Product", "maSP");
  },
};


