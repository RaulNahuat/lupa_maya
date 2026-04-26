'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      //Crear la tabla de admins
      await queryInterface.createTable('admins', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT
        },
        email: {
          type: Sequelize.STRING(120),
          allowNull: false,
          unique: true
        },
        password_hash: {
          type: Sequelize.STRING(255),
          allowNull: false
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
        },
        local_id: {
          type: Sequelize.STRING(36),
          allowNull: true,
          unique: true
        }
      }, { transaction });

      // Mover datos de ADMIN a admins
      await queryInterface.sequelize.query(
        `INSERT INTO admins (email, password_hash, local_id, created_at, updated_at) 
         SELECT email, password_hash, local_id, created_at, updated_at 
         FROM usuarios WHERE rol = 'ADMIN';`,
        { transaction }
      );

      //Eliminar registros de usuarios para evitar problemas con las nuevas columnas NOT NULL
      await queryInterface.sequelize.query(
        `DELETE FROM usuarios;`,
        { transaction }
      );

      //Modificar tabla usuarios
      await queryInterface.removeColumn('usuarios', 'email', { transaction });
      await queryInterface.removeColumn('usuarios', 'password_hash', { transaction });
      await queryInterface.removeColumn('usuarios', 'rol', { transaction });

      //Añadir nuevas columnas
      await queryInterface.addColumn('usuarios', 'username', {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      }, { transaction });
      
      await queryInterface.addColumn('usuarios', 'escuela', {
        type: Sequelize.STRING(150),
        allowNull: false
      }, { transaction });
      
      await queryInterface.addColumn('usuarios', 'lugar_procedencia', {
        type: Sequelize.STRING(150),
        allowNull: false
      }, { transaction });
      
      await queryInterface.addColumn('usuarios', 'genero', {
        type: Sequelize.ENUM('Masculino', 'Femenino'),
        allowNull: false
      }, { transaction });
      
      await queryInterface.addColumn('usuarios', 'grado', {
        type: Sequelize.STRING(50),
        allowNull: false
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
      //Revertir cambios en usuarios
      await queryInterface.removeColumn('usuarios', 'username', { transaction });
      await queryInterface.removeColumn('usuarios', 'escuela', { transaction });
      await queryInterface.removeColumn('usuarios', 'lugar_procedencia', { transaction });
      await queryInterface.removeColumn('usuarios', 'genero', { transaction });
      await queryInterface.removeColumn('usuarios', 'grado', { transaction });

      await queryInterface.addColumn('usuarios', 'email', {
        type: Sequelize.STRING(120),
        allowNull: true,
        unique: true
      }, { transaction });
      
      await queryInterface.addColumn('usuarios', 'password_hash', {
        type: Sequelize.STRING(255),
        allowNull: true
      }, { transaction });
      
      await queryInterface.addColumn('usuarios', 'rol', {
        type: Sequelize.ENUM('NINO', 'ADMIN'),
        allowNull: false,
        defaultValue: 'NINO'
      }, { transaction });

      //Mover datos de vuelta
      await queryInterface.sequelize.query(
        `INSERT INTO usuarios (email, password_hash, rol, local_id, created_at, updated_at, nombre, apellido) 
         SELECT email, password_hash, 'ADMIN', local_id, created_at, updated_at, 'Admin', 'Migrado' 
         FROM admins;`,
        { transaction }
      );

      //Eliminar tabla admins
      await queryInterface.dropTable('admins', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
