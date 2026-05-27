'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const insignias = [
      {
        nombre: 'Paso en el Sacbé',
        descripcion: '¡Has dado tu primer paso en el camino blanco! Tu viaje por la escritura antigua acaba de comenzar.',
        icono_url: '/assets/images/badges/primerGlifoEscaneado.png',
        tipo_condicion: 'ESCANEOS',
        valor_condicion: 1,
        version: 1
      },
      {
        nombre: 'Guardián del Kin',
        descripcion: 'El sol sigue su curso y tú también. ¡Has obtenido la insignia por tu constancia diaria!',
        icono_url: '/assets/images/badges/racha3Dias.png',
        tipo_condicion: 'RACHA',
        valor_condicion: 3,
        version: 1
      },
      {
        nombre: 'Corazon de la Ceiba',
        descripcion: '¡Has echado raíces! Siete días de constancia te conectan con el corazón de la ceiba sagrada. ¡Tu aprendizaje sigue creciendo con fuerza hacia el cielo!',
        icono_url: '/assets/images/badges/racha7días.png',
        tipo_condicion: 'RACHA',
        valor_condicion: 7,
        version: 1
      }
    ];

    await queryInterface.bulkInsert('insignias', insignias, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('insignias', {
      nombre: {
        [Sequelize.Op.in]: ['Paso en el Sacbé', 'Guardián del Kin', 'Corazon de la Ceiba']
      }
    }, {});
  }
};
