'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UsuarioGrupoNivel extends Model {
    static associate(models) {
      UsuarioGrupoNivel.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
      UsuarioGrupoNivel.belongsTo(models.GrupoNivel, { foreignKey: 'grupo_nivel_id', as: 'grupoNivel' });
    }
  }

  UsuarioGrupoNivel.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    usuario_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    grupo_nivel_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'UsuarioGrupoNivel',
    tableName: 'usuario_grupo_nivel',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return UsuarioGrupoNivel;
};
