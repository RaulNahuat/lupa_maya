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

    //Nuevos campos para registro de Niño
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: false
    },
    escuela: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    lugar_procedencia: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    genero: {
      type: DataTypes.ENUM('Masculino', 'Femenino'),
      allowNull: false
    },
    grado: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    racha: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    //Para iniciar sesion con el perfil de niño
    pin_hash: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Usuario;
};