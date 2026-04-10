'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Nivel extends Model {
    static associate(models) {
      Nivel.belongsTo(models.GrupoNivel, { foreignKey: 'grupo_id', as: 'grupo' });
      Nivel.hasMany(models.NivelGlifoObjetivo, { foreignKey: 'nivel_id', as: 'glifosObjetivos' });
      Nivel.hasMany(models.Pregunta, { foreignKey: 'nivel_id', as: 'preguntas' });
      Nivel.hasMany(models.ProgresoUsuario, { foreignKey: 'nivel_id', as: 'progresos' });
      Nivel.hasMany(models.RegistroEscaneo, { foreignKey: 'nivel_id', as: 'escaneos' });
    }
  }

  Nivel.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    grupo_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    tipo: {
      type: DataTypes.ENUM('APRENDIZAJE', 'BUSQUEDA'),
      allowNull: false
    },
    orden_secuencia: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'Nivel',
    tableName: 'niveles',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at'
  });

  return Nivel;
};