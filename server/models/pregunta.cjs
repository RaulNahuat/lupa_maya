'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pregunta extends Model {
    static associate(models) {
      Pregunta.belongsTo(models.Nivel, { foreignKey: 'nivel_id', as: 'nivel' });
      Pregunta.hasMany(models.OpcionRespuesta, { foreignKey: 'preguntas_id', as: 'opciones' });
    }
  }

  Pregunta.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    nivel_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    texto_pregunta: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    activa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Pregunta',
    tableName: 'preguntas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Pregunta;
};