"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "Category",
      [
        {
          name: "Combo LiveStream",
          icon: "fas fa-laptop",
          status: true,
          parentId: null, // Root category
        },
        {
          name: "Phụ kiện thu âm",
          icon: "fas fa-tshirt",
          status: true,
          parentId: null, // Root category
        },
        {
          name: "Loa kiểm âm",
          icon: "fas fa-book",
          status: true,
          parentId: null, // Root category
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Category", null, {});
  },
};