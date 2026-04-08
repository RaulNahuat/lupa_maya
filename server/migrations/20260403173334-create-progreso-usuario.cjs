'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('progreso_usuarios', {
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
      completado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      estrellas: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      intentos: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      ultimo_intento: {
        type: Sequelize.DATE,
        allowNull: true
      },
      sync_status: {
        type: Sequelize.ENUM('SINCRONIZADO', 'PENDIENTE', 'EN_CONFLICTO'),
        defaultValue: 'SINCRONIZADO'
      },
      local_id: {
        type: Sequelize.STRING(36),
        allowNull: true,
        unique: true
      },
      usuario_local_id: {
        type: Sequelize.STRING(36),
        allowNull: true
      },
      last_synced_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Unique constraint (usuario_id, nivel_id)
    await queryInterface.addIndex('progreso_usuarios', ['usuario_id', 'nivel_id'], {
      unique: true,
      name: 'progreso_usuarios_usuario_nivel_unique'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('progreso_usuarios');
  }
};