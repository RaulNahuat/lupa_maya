'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Insignia extends Model {
    static associate(models) {
      Insignia.belongsToMany(models.Usuario, {
        through: models.UsuarioInsignia,
        foreignKey: 'insignia_id',
        as: 'usuarios'
      });
    }
  }

  Insignia.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icono_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tipo_condicion: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    valor_condicion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'Insignia',
    tableName: 'insignias',
    timestamps: false
  });

  return Insignia;
};