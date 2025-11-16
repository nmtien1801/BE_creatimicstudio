"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "User", // 5 data
      [
        {
          userName: "ThuyNhi",
          email: "user@gmail.com",
          password:
            "$2a$10$zHwMBVyL3Cbwq8hfEFryJeVaUW45Dxs.KuLUKWf9DAMtTJzp3m5vK", // 1234
          title: "Front-end Developer",
          image: "https://via.placeholder.com/150",
          description: "A passionate web developer",
          phone: "0967273063",
          address: "123 Main St, City, Country",
          roleID: 2, // 1: Admin, 2: User
        },
        {
          userName: "MinhTien",
          email: "teacher@gmail.com",
          password:
            "$2a$10$zHwMBVyL3Cbwq8hfEFryJeVaUW45Dxs.KuLUKWf9DAMtTJzp3m5vK", // 1234
          title: "UX/UI Designer",
          image: "https://via.placeholder.com/150",
          description:
            "Convallis in semper laoreet nibh leo. Vivamus  malesuada ipsum pulvinar non rutrum risus dui, risus. Purus massa velit iaculis tincidunt tortor, risus, scelerisque risus... See more",
          phone: "0967273063",
          address: "1/15/4 Nguyễn Thái Sơn, Phường 3, Gò Vấp, TP HCM",
          roleID: 1, // 1: Admin, 2: User
        },
        {
          userName: "AliceJohnson",
          email: "alice.johnson@example.com",
          password:
            "$2a$10$zHwMBVyL3Cbwq8hfEFryJeVaUW45Dxs.KuLUKWf9DAMtTJzp3m5vK", // 1234

          image: "",
          description: "Data scientist with a focus on AI.",
          phone: "1122334455",
          address: "789 Oak St, City, Country",
          title: "Data Scientist",
          roleID: 2, // Assuming 3: Data Scientist
        },
        {
          userName: "BobBrown",
          email: "bob.brown@example.com",
          password:
            "$2a$10$zHwMBVyL3Cbwq8hfEFryJeVaUW45Dxs.KuLUKWf9DAMtTJzp3m5vK", // 1234
          image: "",
          description:
            "Software engineer with expertise in backend development.",
          phone: "2233445566",
          address: "101 Pine St, City, Country",
          title: "Backend Developer",
          roleID: 2, // Assuming 4: Backend Developer
        },
        {
          userName: "CharlieDavis",
          email: "charlie.davis@example.com",
          password:
            "$2a$10$zHwMBVyL3Cbwq8hfEFryJeVaUW45Dxs.KuLUKWf9DAMtTJzp3m5vK", // 1234
          image: "",
          description: "UI/UX designer with a passion for creative design.",
          phone: "3344556677",
          address: "202 Maple St, City, Country",
          title: "UI/UX Designer",
          roleID: 2, // Assuming 5: UI/UX Designer
        },
        {
          userName: "Hoa",
          email: "charlie.davis@example.com",
          password:
            "$2a$10$zHwMBVyL3Cbwq8hfEFryJeVaUW45Dxs.KuLUKWf9DAMtTJzp3m5vK", // 1234
          image: "",
          description: "UI/UX designer with a passion for creative design.",
          phone: "3344556677",
          address: "202 Maple St, City, Country",
          title: "UI/UX Designer",
          roleID: 1, // Assuming 5: UI/UX Designer
        },
        {
          userName: "Ly Ly",
          email: "charlie.davis@example.com",
          password:
            "$2a$10$zHwMBVyL3Cbwq8hfEFryJeVaUW45Dxs.KuLUKWf9DAMtTJzp3m5vK", // 1234
          image: "",
          description: "UI/UX designer with a passion for creative design.",
          phone: "3344556677",
          address: "202 Maple St, City, Country",
          title: "UI/UX Designer",
          roleID: 1, // Assuming 5: UI/UX Designer
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};

// npx sequelize-cli db:seed --seed seeder_user.js
