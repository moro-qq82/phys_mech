'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mechanism_categories', {
      mechanism_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'mechanisms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    // 複合主キーを作成
    await queryInterface.addConstraint('mechanism_categories', {
      fields: ['mechanism_id', 'category_id'],
      type: 'primary key',
      name: 'mechanism_categories_pkey'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mechanism_categories');
  }
};
