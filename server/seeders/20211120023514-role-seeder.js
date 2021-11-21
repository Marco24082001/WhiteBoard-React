'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('roles', [
      {
        role: 'owner',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        role: 'edited',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        role: 'only see',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        role: 'kicked',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('roles', null, {});
  }
};
