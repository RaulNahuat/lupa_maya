'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GrupoEscolar extends Model {
    static associate(models) {
      GrupoEscolar.belongsTo(models.Usuario, { foreignKey: 'docente_id', as: 'docente' });
      GrupoEscolar.hasMany(models.Usuario, { foreignKey: 'grupo_escolar_id', as: 'usuarios' });
      GrupoEscolar.belongsToMany(models.GrupoNivel, {
        through: models.GrupoEscolarGrupoNivel,
        foreignKey: 'grupo_escolar_id',
        otherKey: 'grupo_nivel_id',
        as: 'gruposNiveles'
      });
    }
  }

  GrupoEscolar.init({
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
    docente_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    local_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'GrupoEscolar',
    tableName: 'grupos_escolares',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return GrupoEscolar;
};
