'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('nivel_glifos_objetivos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      nivel_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'niveles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      glifo_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'glifos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      orden_aparicion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('nivel_glifos_objetivos');
  }
};