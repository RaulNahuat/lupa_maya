'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cola_sincronizacion', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      entidad: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      entidad_id: {
        type: Sequelize.STRING(36),
        allowNull: false
      },
      accion: {
        type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE'),
        allowNull: false
      },
      datos: {
        type: Sequelize.JSON,
        allowNull: true
      },
      estado: {
        type: Sequelize.ENUM('PENDIENTE', 'ENVIADO', 'ERROR'),
        defaultValue: 'PENDIENTE'
      },
      reintentos: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cola_sincronizacion');
  }
};
