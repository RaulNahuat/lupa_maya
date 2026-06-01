'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Agrega la columna posicion_bloque como permitiendo NULL de forma temporal
      await queryInterface.addColumn('niveles', 'posicion_bloque', {
        type: Sequelize.INTEGER,
        allowNull: true
      }, { transaction });

      //Consulta todos los niveles existentes ordenados por grupo y orden de secuencia original
      const [niveles] = await queryInterface.sequelize.query(
        'SELECT id, grupo_id, numero, orden_secuencia FROM niveles ORDER BY grupo_id ASC, orden_secuencia ASC',
        { transaction }
      );

      //Calcula y actualiza posicion_bloque en memoria por cada grupo
      const grupoContadores = {};
      for (const nivel of niveles) {
        const grupoId = nivel.grupo_id;
        if (!grupoContadores[grupoId]) {
          grupoContadores[grupoId] = 1;
        } else {
          grupoContadores[grupoId] += 1;
        }

        const nuevaPosicion = grupoContadores[grupoId];
        await queryInterface.sequelize.query(
          'UPDATE niveles SET posicion_bloque = ? WHERE id = ?',
          {
            replacements: [nuevaPosicion, nivel.id],
            transaction
          }
        );
      }

      //Modifica posicion_bloque para que sea NOT NULL
      await queryInterface.changeColumn('niveles', 'posicion_bloque', {
        type: Sequelize.INTEGER,
        allowNull: false
      }, { transaction });

      //Eliminar el índice único global actual de la columna 'numero'
      // En MySQL, el índice único global sobre la columna se llama igual que la columna
      try {
        await queryInterface.removeIndex('niveles', 'numero', { transaction });
      } catch (err) {
        console.warn('Advertencia al remover índice "numero":', err.message);
      }

      //Eliminar la columna orden_secuencia
      await queryInterface.removeColumn('niveles', 'orden_secuencia', { transaction });

      //Crear los índices compuestos únicos nuevos
      await queryInterface.addIndex('niveles', ['grupo_id', 'numero'], {
        unique: true,
        name: 'niveles_grupo_id_numero_unique',
        transaction
      });

      await queryInterface.addIndex('niveles', ['grupo_id', 'posicion_bloque'], {
        unique: true,
        name: 'niveles_grupo_id_posicion_bloque_unique',
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
      //Agregar de vuelta la columna orden_secuencia
      await queryInterface.addColumn('niveles', 'orden_secuencia', {
        type: Sequelize.INTEGER,
        allowNull: true
      }, { transaction });

      //Eliminar índices compuestos únicos
      await queryInterface.removeIndex('niveles', 'niveles_grupo_id_numero_unique', { transaction });
      await queryInterface.removeIndex('niveles', 'niveles_grupo_id_posicion_bloque_unique', { transaction });

      //Consultar todos los niveles para restaurar un orden_secuencia global secuencial
      const [niveles] = await queryInterface.sequelize.query(
        'SELECT id, grupo_id, posicion_bloque FROM niveles ORDER BY grupo_id ASC, posicion_bloque ASC',
        { transaction }
      );

      let secuenciaGlobal = 1;
      for (const nivel of niveles) {
        await queryInterface.sequelize.query(
          'UPDATE niveles SET orden_secuencia = ? WHERE id = ?',
          {
            replacements: [secuenciaGlobal++, nivel.id],
            transaction
          }
        );
      }

      //Modificar orden_secuencia a NOT NULL
      await queryInterface.changeColumn('niveles', 'orden_secuencia', {
        type: Sequelize.INTEGER,
        allowNull: false
      }, { transaction });

      //Agregar de vuelta el índice único global sobre la columna numero
      await queryInterface.addIndex('niveles', ['numero'], {
        unique: true,
        name: 'numero',
        transaction
      });

      //Elimina la columna posicion_bloque
      await queryInterface.removeColumn('niveles', 'posicion_bloque', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
