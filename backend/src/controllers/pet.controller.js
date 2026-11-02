const Pet = require('../models/Pet');
const { Sequelize } = require('sequelize');

// RF-01 & RF-02 & RF-03: Consulta con filtros y regla de 7 días
exports.getPets = async (req, res) => {
  try {
    const { species } = req.query;
    const filter = { status: 'Disponible' };

    if (species && ['Perro', 'Gato'].includes(species)) {
      filter.species = species;
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const pets = await Pet.findAll({
      where: filter,
      order: [
        [
          Sequelize.literal(`CASE WHEN "lastActivityAt" <= '${sevenDaysAgo.toISOString()}' THEN 0 ELSE 1 END`),
          'ASC'
        ],
        ['lastActivityAt', 'ASC']
      ]
    });

    res.status(200).json({ success: true, count: pets.length, data: pets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error en el servidor al consultar el catálogo' });
  }
};

// Función para sembrar datos iniciales de prueba
exports.seedPets = async (req, res) => {
  try {
    await Pet.bulkCreate([
      {
        name: 'Luna',
        species: 'Perro',
        approximateAge: '2 años',
        description: 'Perrita juguetona y sociable, rescatada del sector centro.',
        imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500',
        status: 'Disponible'
      },
      {
        name: 'Simba',
        species: 'Gato',
        approximateAge: '1 año',
        description: 'Gato muy cariñoso y tranquilo, le encanta dormir al sol.',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500',
        status: 'Disponible'
      },
      {
        name: 'Rocky',
        species: 'Perro',
        approximateAge: '4 años',
        description: 'Perro guardián, leal y entrenado en comandos básicos.',
        imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500',
        status: 'Disponible'
      }
    ]);

    res.status(201).json({ success: true, message: '¡Mascotas de prueba creadas con éxito!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al sembrar mascotas' });
  }
};

// RF-07: Registro de nuevas mascotas desde el módulo administrativo
exports.createPet = async (req, res) => {
  try {
    const fields = ['name', 'species', 'approximateAge', 'description', 'imageUrl'];
    const data = Object.fromEntries(fields.map((field) => [field, typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field]]));

    if (!data.name || !data.species || !data.approximateAge || !data.description) {
      return res.status(400).json({ success: false, message: 'Completa todos los campos obligatorios.' });
    }
    if (!['Perro', 'Gato'].includes(data.species)) {
      return res.status(400).json({ success: false, message: 'La especie debe ser Perro o Gato.' });
    }

    const pet = await Pet.create({ ...data, imageUrl: data.imageUrl || null, status: 'Disponible' });
    return res.status(201).json({ success: true, message: `${pet.name} fue agregado al catálogo.`, data: pet });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'No fue posible registrar la mascota.' });
  }
};
