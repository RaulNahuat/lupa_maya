'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('registro_escaneos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      usuario_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      nivel_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'niveles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      glifo_escaneado_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'glifos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      es_correcto: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      mensaje_feedback: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fecha_escaneo: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      sync_status: {
        type: Sequelize.ENUM('SINCRONIZADO', 'PENDIENTE'),
        defaultValue: 'SINCRONIZADO'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('registro_escaneos');
  }
};