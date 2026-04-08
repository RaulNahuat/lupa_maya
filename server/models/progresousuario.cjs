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
      allowNull: false
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
      {
        unique: true,
        fields: ['usuario_id', 'nivel_id']
      }
    ]
  });

  return ProgresoUsuario;
};