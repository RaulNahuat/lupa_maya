'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.hasMany(models.ProgresoUsuario, { foreignKey: 'usuario_id', as: 'progresos' });
      Usuario.hasMany(models.RegistroEscaneo, { foreignKey: 'usuario_id', as: 'escaneos' });
      Usuario.belongsToMany(models.Insignia, {
        through: models.UsuarioInsignia,
        foreignKey: 'usuario_id',
        as: 'insignias'
      });
    }
  }

  Usuario.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rol: {
      type: DataTypes.ENUM('NINO', 'ADMIN'),
      allowNull: false,
      defaultValue: 'NINO'
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Usuario;
};