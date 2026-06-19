'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GrupoEscolarGrupoNivel extends Model {
    static associate(models) {
      GrupoEscolarGrupoNivel.belongsTo(models.GrupoEscolar, { foreignKey: 'grupo_escolar_id', as: 'grupoEscolar' });
      GrupoEscolarGrupoNivel.belongsTo(models.GrupoNivel, { foreignKey: 'grupo_nivel_id', as: 'grupoNivel' });
    }
  }

  GrupoEscolarGrupoNivel.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    grupo_escolar_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    grupo_nivel_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'GrupoEscolarGrupoNivel',
    tableName: 'grupo_escolar_grupo_nivel',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return GrupoEscolarGrupoNivel;
};
