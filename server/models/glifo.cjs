'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Glifo extends Model {
    static associate(models) {
      Glifo.belongsTo(models.GrupoNivel, { foreignKey: 'grupo_id', as: 'grupo' });
      Glifo.hasMany(models.NivelGlifoObjetivo, { foreignKey: 'glifo_id', as: 'objetivos' });
      Glifo.hasMany(models.RegistroEscaneo, { foreignKey: 'glifo_escaneado_id', as: 'escaneos' });
    }
  }

  Glifo.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    grupo_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    nombre_maya: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    significado_es: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    pronunciacion: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    imagen_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    audio_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    video_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    clase_modelo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Glifo',
    tableName: 'glifos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Glifo;
};