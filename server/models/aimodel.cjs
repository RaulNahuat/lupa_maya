'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AiModel extends Model {
    static associate(models) {
    }
  }

  AiModel.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    version: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    model_url: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    metadata_url: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'AiModel',
    tableName: 'ai_models',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return AiModel;
};