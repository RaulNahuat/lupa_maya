'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('grupos_escolares', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT
        },
        nombre: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        descripcion: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        docente_id: {
          type: Sequelize.BIGINT,
          allowNull: true,
          references: {
            model: 'admins',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        local_id: {
          type: Sequelize.STRING(36),
          allowNull: true,
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

      await queryInterface.addColumn('usuarios', 'grupo_escolar_id', {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'grupos_escolares',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });

      await queryInterface.createTable('grupo_escolar_grupo_nivel', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.BIGINT
        },
        grupo_escolar_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'grupos_escolares',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        grupo_nivel_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'grupos_niveles',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        activo: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
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

      await queryInterface.addIndex('grupo_escolar_grupo_nivel', ['grupo_escolar_id', 'grupo_nivel_id'], {
        unique: true,
        name: 'grupo_escolar_nivel_unique',
        transaction
      });

      await queryInterface.createTable('usuario_grupo_nivel', {
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
          onDelete: 'CASCADE'
        },
        grupo_nivel_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'grupos_niveles',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        activo: {
          type: Sequelize.BOOLEAN,
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
        }
      }, { transaction });

      await queryInterface.addIndex('usuario_grupo_nivel', ['usuario_id', 'grupo_nivel_id'], {
        unique: true,
        name: 'usuario_grupo_nivel_unique',
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
      await queryInterface.dropTable('usuario_grupo_nivel', { transaction });
      await queryInterface.dropTable('grupo_escolar_grupo_nivel', { transaction });
      await queryInterface.removeColumn('usuarios', 'grupo_escolar_id', { transaction });
      await queryInterface.dropTable('grupos_escolares', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
