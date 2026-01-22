"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "User",
      [
        {
          userName: "Nguyen Thanh Thao",
          email: "admin@gmail.com",
          password:
            "$2a$10$zHwMBVyL3Cbwq8hfEFryJeVaUW45Dxs.KuLUKWf9DAMtTJzp3m5vK", // 1234
          image: "https://via.placeholder.com/150",
          phone: "0967273063",
          address: "123 Main St, City, Country",
          role: "admin",
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("User", null, {});
  },
};

// npx sequelize-cli db:seed --seed seeder_user.js
