'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('grupos_escolares', 'docente_id', { transaction });

      await queryInterface.addColumn('grupos_escolares', 'docente_id', {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('grupos_escolares', 'docente_id', { transaction });
      await queryInterface.addColumn('grupos_escolares', 'docente_id', {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'admins',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
