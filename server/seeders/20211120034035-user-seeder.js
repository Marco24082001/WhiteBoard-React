'use strict';
const bcrypt = require("bcrypt");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hash = await bcrypt.hash('P4ssword', 10);
    const users = [];
    for(let i = 0; i < 10; i++) {
      users.push({
        username: `user${i+1}`,
        password: hash,
        email: `user${i+1}@gmail.com`,
        photo: 'https://res.cloudinary.com/h-b-ch-khoa/image/upload/v1636871977/question_xfpegi.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
    return queryInterface.bulkInsert('users', users, {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('users',null, {})
  }
};
