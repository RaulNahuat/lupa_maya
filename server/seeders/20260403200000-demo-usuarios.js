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
        rol: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        nombre: 'María',
        apellido: 'López',
        email: 'maria.lopez@lupamaya.com',
        password_hash: await bcrypt.hash('Nino1234!', saltRounds),
        rol: 'NINO',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        nombre: 'Carlos',
        apellido: 'Pérez',
        email: 'carlos.perez@lupamaya.com',
        password_hash: await bcrypt.hash('Nino1234!', saltRounds),
        rol: 'NINO',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        nombre: 'Ana',
        apellido: 'García',
        email: 'ana.garcia@lupamaya.com',
        password_hash: await bcrypt.hash('Nino1234!', saltRounds),
        rol: 'NINO',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        nombre: 'Luis',
        apellido: 'Martínez',
        email: 'luis.martinez@lupamaya.com',
        password_hash: await bcrypt.hash('Nino1234!', saltRounds),
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
      email: {
        [Sequelize.Op.in]: [
          'admin@lupamaya.com',
          'maria.lopez@lupamaya.com',
          'carlos.perez@lupamaya.com',
          'ana.garcia@lupamaya.com',
          'luis.martinez@lupamaya.com'
        ]
      }
    }, {});
  }
};