'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RegistroEscaneo extends Model {
    static associate(models) {
      RegistroEscaneo.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
      RegistroEscaneo.belongsTo(models.Nivel, { foreignKey: 'nivel_id', as: 'nivel' });
      RegistroEscaneo.belongsTo(models.Glifo, { foreignKey: 'glifo_escaneado_id', as: 'glifo' });
    }
  }

  RegistroEscaneo.init({
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
    glifo_escaneado_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    es_correcto: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    mensaje_feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha_escaneo: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    sync_status: {
      type: DataTypes.ENUM('SINCRONIZADO', 'PENDIENTE'),
      defaultValue: 'SINCRONIZADO'
    }
  }, {
    sequelize,
    modelName: 'RegistroEscaneo',
    tableName: 'registro_escaneos',
    timestamps: false
  });

  return RegistroEscaneo;
};