'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ColaSincronizacion extends Model {
    static associate(models) {
      //
    }
  }

  ColaSincronizacion.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    entidad: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    entidad_id: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    accion: {
      type: DataTypes.ENUM('CREAR', 'ACTUALIZAR', 'ELIMINAR'),
      allowNull: false
    },
    datos: {
      type: DataTypes.JSON,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'ENVIADO', 'ERROR'),
      defaultValue: 'PENDIENTE'
    },
    reintentos: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'ColaSincronizacion',
    tableName: 'cola_sincronizacion',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return ColaSincronizacion;
};