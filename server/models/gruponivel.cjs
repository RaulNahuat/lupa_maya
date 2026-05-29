'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GrupoNivel extends Model {
    static associate(models) {
      GrupoNivel.hasMany(models.Glifo, { foreignKey: 'grupo_id', as: 'glifos' });
      GrupoNivel.hasMany(models.Nivel, { foreignKey: 'grupo_id', as: 'niveles' });
    }
  }

  GrupoNivel.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    numero_grupo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dificultad: {
      type: DataTypes.ENUM('BASICO', 'INTERMEDIO', 'AVANZADO'),
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: '#16A34A'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'GrupoNivel',
    tableName: 'grupos_niveles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return GrupoNivel;
};