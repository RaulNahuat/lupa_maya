'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProgresoUsuario extends Model {
    static associate(models) {
      ProgresoUsuario.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
      ProgresoUsuario.belongsTo(models.Nivel, { foreignKey: 'nivel_id', as: 'nivel' });
    }
  }

  ProgresoUsuario.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    usuario_id: {
      type: DataTypes.BIGINT,
      // allowNull: true para soportar usuarios registrados offline que aún
      // no tienen ID del servidor. syncService propaga el ID real una vez
      // que el usuario se sincroniza.
      allowNull: true
    },
    nivel_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    completado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    estrellas: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    intentos: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    ultimo_intento: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sync_status: {
      type: DataTypes.ENUM('SINCRONIZADO', 'PENDIENTE', 'EN_CONFLICTO'),
      defaultValue: 'SINCRONIZADO'
    },
    local_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      unique: true
    },
    usuario_local_id: {
      type: DataTypes.STRING(36),
      allowNull: true
    },
    last_synced_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ProgresoUsuario',
    tableName: 'progreso_usuarios',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at',
    indexes: [
      // El unique ya no puede ser (usuario_id, nivel_id) porque usuario_id
      // puede ser NULL mientras el usuario no se haya sincronizado.
      // local_id es el identificador único confiable desde el cliente.
      {
        unique: true,
        fields: ['local_id'],
        name: 'progreso_usuarios_local_id_unique'
      }
    ]
  });

  return ProgresoUsuario;
};