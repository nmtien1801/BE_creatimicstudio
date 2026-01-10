"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Post", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      image: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      detail: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.BOOLEAN,
      },
      userUpdate: {
        type: Sequelize.STRING,
      },
      userCreate: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("Post");
  },
};
