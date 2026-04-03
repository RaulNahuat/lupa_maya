'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('grupos_niveles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      numero_grupo: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      dificultad: {
        type: Sequelize.ENUM('BASICO', 'INTERMEDIO', 'AVANZADO'),
        allowNull: false
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('grupos_niveles');
  }
};