'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      try {
        await queryInterface.removeConstraint('progreso_usuarios', 'progreso_usuarios_ibfk_1', { transaction });
      } catch (e) {
      }
      try {
        await queryInterface.removeConstraint('progreso_usuarios', 'progreso_usuarios_ibfk_3', { transaction });
      } catch (e) {
      }

      await queryInterface.changeColumn('progreso_usuarios', 'usuario_id', {
        type: Sequelize.BIGINT,
        allowNull: true
      }, { transaction });
      await queryInterface.addConstraint('progreso_usuarios', {
        fields: ['usuario_id'],
        type: 'foreign key',
        name: 'progreso_usuarios_usuario_id_fk',
        references: {
          table: 'usuarios',
          field: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        transaction
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      try {
        await queryInterface.removeConstraint('progreso_usuarios', 'progreso_usuarios_usuario_id_fk', { transaction });
      } catch (e) {}

      await queryInterface.changeColumn('progreso_usuarios', 'usuario_id', {
        type: Sequelize.BIGINT,
        allowNull: false
      }, { transaction });

      await queryInterface.addConstraint('progreso_usuarios', {
        fields: ['usuario_id'],
        type: 'foreign key',
        references: {
          table: 'usuarios',
          field: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        transaction
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
