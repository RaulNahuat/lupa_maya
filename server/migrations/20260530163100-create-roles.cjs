'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Crea la tabla de roles
      await queryInterface.createTable('roles', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT
        },
        nombre: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true
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
        }
      }, { transaction });

      // Insertar los roles por defecto
      await queryInterface.bulkInsert('roles', [
        { id: 1, nombre: 'administrador', created_at: new Date(), updated_at: new Date() },
        { id: 2, nombre: 'usuario', created_at: new Date(), updated_at: new Date() },
        { id: 3, nombre: 'docente', created_at: new Date(), updated_at: new Date() }
      ], { transaction });

      // Añade columna rol_id a la tabla de usuarios
      await queryInterface.addColumn('usuarios', 'rol_id', {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 2, // 'usuario' por defecto
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }, { transaction });

      // añade columna rol_id a la tabla de admins
      await queryInterface.addColumn('admins', 'rol_id', {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 1, // 'administrador' por defecto
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
      // Quita columna rol_id de admins
      await queryInterface.removeColumn('admins', 'rol_id', { transaction });

      // Quita columna rol_id de usuarios
      await queryInterface.removeColumn('usuarios', 'rol_id', { transaction });

      // Elimina la tabla de roles
      await queryInterface.dropTable('roles', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
