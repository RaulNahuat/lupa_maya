'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('glifos', {
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
      nombre_maya: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      significado_es: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      pronunciacion: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      imagen_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      audio_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      video_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      version: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('glifos');
  }
};