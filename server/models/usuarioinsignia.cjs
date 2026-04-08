'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UsuarioInsignia extends Model {
    static associate(models) {
      UsuarioInsignia.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
      UsuarioInsignia.belongsTo(models.Insignia, { foreignKey: 'insignia_id', as: 'insignia' });
    }
  }

  UsuarioInsignia.init({
    usuario_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    insignia_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    obtenida_en: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    sync_status: {
      type: DataTypes.ENUM('SINCRONIZADO', 'PENDIENTE'),
      defaultValue: 'SINCRONIZADO'
    },
    local_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      unique: true
    },
    usuario_local_id: {
      type: DataTypes.STRING(36),
      allowNull: true
    },
    last_synced_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'UsuarioInsignia',
    tableName: 'usuario_insignias',
    timestamps: false
  });

  return UsuarioInsignia;
};