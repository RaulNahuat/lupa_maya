'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static associate(models) {
      Admin.belongsTo(models.Role, { foreignKey: 'rol_id', as: 'rol' });
    }
  }

  Admin.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    rol_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 1
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    local_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Admin',
    tableName: 'admins',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Admin;
};
