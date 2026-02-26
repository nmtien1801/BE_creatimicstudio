"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // add new boolean column default false
    await queryInterface.addColumn("Product", "isTopSeller", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Product", "isTopSeller");
  },
};
