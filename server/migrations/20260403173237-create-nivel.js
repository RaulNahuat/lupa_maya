'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('niveles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      grupo_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'grupos_niveles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      numero: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
      },
      tipo: {
        type: Sequelize.ENUM('APRENDIZAJE', 'BUSQUEDA'),
        allowNull: false
      },
      orden_secuencia: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('niveles');
  }
};