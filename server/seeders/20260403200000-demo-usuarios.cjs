'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = 10;

    const usuarios = [
      {
        nombre: 'Admin',
        apellido: 'Sistema',
        email: 'admin@lupamaya.com',
        password_hash: await bcrypt.hash('Admin1234!', saltRounds),
        pin_hash: null,
        rol: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@lupamaya.com',
        password_hash: await bcrypt.hash('Admin1234', saltRounds),
        pin_hash: null,
        rol: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        nombre: 'María',
        apellido: 'López',
        email: null,
        password_hash: null,
        pin_hash: await bcrypt.hash('1234', saltRounds),
        rol: 'NINO',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        nombre: 'Carlos',
        apellido: 'Pérez',
        email: null,
        password_hash: null,
        pin_hash: await bcrypt.hash('1234', saltRounds),
        rol: 'NINO',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        nombre: 'Ana',
        apellido: 'García',
        email: null,
        password_hash: null,
        pin_hash: await bcrypt.hash('1234', saltRounds),
        rol: 'NINO',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        nombre: 'Luis',
        apellido: 'Martínez',
        email: null,
        password_hash: null,
        pin_hash: await bcrypt.hash('1234', saltRounds),
        rol: 'NINO',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      }
    ];

    await queryInterface.bulkInsert('usuarios', usuarios, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', {
      nombre: {
        [Sequelize.Op.in]: ['Admin', 'Juan', 'María', 'Carlos', 'Ana', 'Luis']
      }
    }, {});
  }
};