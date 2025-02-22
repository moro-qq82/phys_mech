'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [{
      id: uuidv4(),
      email: 'test@example.com',
      password_hash: 'test123', // 本番環境では必ずハッシュ化すること
      username: 'testuser',
      display_name: 'テストユーザー',
      bio: 'これはテストユーザーのプロフィールです。',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
