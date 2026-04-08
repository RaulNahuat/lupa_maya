'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OpcionRespuesta extends Model {
    static associate(models) {
      OpcionRespuesta.belongsTo(models.Pregunta, { foreignKey: 'preguntas_id', as: 'pregunta' });
    }
  }

  OpcionRespuesta.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    preguntas_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    texto_opcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    es_correcta: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'OpcionRespuesta',
    tableName: 'opciones_respuestas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return OpcionRespuesta;
};