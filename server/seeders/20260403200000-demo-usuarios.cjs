'use strict';
const bcrypt = require('bcryptjs');

const crypto = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = 10;

    const admins = [
      {
        local_id: crypto.randomUUID(),
        email: 'admin@lupamaya.com',
        password_hash: await bcrypt.hash('Admin1234!', saltRounds),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        local_id: crypto.randomUUID(),
        email: 'juan@lupamaya.com.com',
        password_hash: await bcrypt.hash('Admin1234', saltRounds),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    const usuarios = [
      {
        local_id: crypto.randomUUID(),
        nombre: 'María',
        apellido: 'López',
        username: 'marialopez',
        escuela: 'Escuela Maya',
        lugar_procedencia: 'Mérida',
        genero: 'Femenino',
        grado: '3er Grado',
        pin_hash: await bcrypt.hash('1234', saltRounds),
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        local_id: crypto.randomUUID(),
        nombre: 'Carlos',
        apellido: 'Pérez',
        username: 'carlosperez',
        escuela: 'Escuela Maya',
        lugar_procedencia: 'Mérida',
        genero: 'Masculino',
        grado: '3er Grado',
        pin_hash: await bcrypt.hash('1234', saltRounds),
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        local_id: crypto.randomUUID(),
        nombre: 'Ana',
        apellido: 'García',
        username: 'anagarcia',
        escuela: 'Escuela Maya',
        lugar_procedencia: 'Progreso',
        genero: 'Femenino',
        grado: '4to Grado',
        pin_hash: await bcrypt.hash('1234', saltRounds),
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        local_id: crypto.randomUUID(),
        nombre: 'Luis',
        apellido: 'Martínez',
        username: 'luismartinez',
        escuela: 'Escuela Maya',
        lugar_procedencia: 'Progreso',
        genero: 'Masculino',
        grado: '4to Grado',
        pin_hash: await bcrypt.hash('1234', saltRounds),
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      }
    ];

    await queryInterface.bulkInsert('admins', admins, {});
    await queryInterface.bulkInsert('usuarios', usuarios, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admins', {
      email: {
        [Sequelize.Op.in]: ['admin@lupamaya.com', 'juan@lupamaya.com']
      }
    }, {});
    await queryInterface.bulkDelete('usuarios', {
      username: {
        [Sequelize.Op.in]: ['marialopez', 'carlosperez', 'anagarcia', 'luismartinez']
      }
    }, {});
  }
};