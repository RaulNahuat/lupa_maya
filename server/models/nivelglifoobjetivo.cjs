'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NivelGlifoObjetivo extends Model {
    static associate(models) {
      NivelGlifoObjetivo.belongsTo(models.Nivel, { foreignKey: 'nivel_id', as: 'nivel' });
      NivelGlifoObjetivo.belongsTo(models.Glifo, { foreignKey: 'glifo_id', as: 'glifo' });
    }
  }

  NivelGlifoObjetivo.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    nivel_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    glifo_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    orden_aparicion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'NivelGlifoObjetivo',
    tableName: 'nivel_glifos_objetivos',
    timestamps: false
  });

  return NivelGlifoObjetivo;
};