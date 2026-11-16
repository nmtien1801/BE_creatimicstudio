"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Review", "images", {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Review", "images");
  },
};

// npx sequelize-cli db:migrate --to migrate_zzzzz_review_images.js
