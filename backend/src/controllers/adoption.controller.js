const Adoption = require('../models/Adoption');
const Pet = require('../models/Pet');

const requiredFields = ['petId', 'fullName', 'email', 'phone', 'city', 'occupation', 'housingType', 'petExperience', 'adoptionReason'];
const clean = (value) => typeof value === 'string' ? value.trim() : value;

exports.createAdoption = async (req, res) => {
  try {
    const data = Object.fromEntries(Object.entries(req.body).map(([key, value]) => [key, clean(value)]));
    if (requiredFields.some((field) => !data[field])) {
      return res.status(400).json({ success: false, message: 'Completa todos los campos obligatorios.' });
    }

    const pet = await Pet.findOne({ where: { id: data.petId, status: 'Disponible' } });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'La mascota seleccionada no está disponible.' });
    }

    const adoption = await Adoption.create({ ...data, petName: pet.name, status: 'Pendiente' });
    const refugePhone = (process.env.REFUGE_WHATSAPP_NUMBER || '573001234567').replace(/\D/g, '');
    const message = [
      '🐾 *SOLICITUD FORMAL DE ADOPCIÓN*', '',
      `*Mascota:* ${pet.name} (${pet.species})`,
      `*Solicitante:* ${data.fullName}`,
      `*Teléfono:* ${data.phone}`,
      `*Correo:* ${data.email}`,
      `*Ciudad:* ${data.city}`,
      `*Ocupación:* ${data.occupation}`,
      `*Tipo de vivienda:* ${data.housingType}`, '',
      `*Experiencia con mascotas:* ${data.petExperience}`, '',
      `*Motivo para adoptar:* ${data.adoptionReason}`, '',
      `Número de solicitud: ${adoption.id}`
    ].join('\n');

    return res.status(201).json({
      success: true,
      message: 'Solicitud registrada correctamente.',
      data: adoption,
      whatsappUrl: `https://wa.me/${refugePhone}?text=${encodeURIComponent(message)}`
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ success: false, message: 'Verifica que los datos ingresados sean válidos.' });
    }
    return res.status(500).json({ success: false, message: 'No fue posible registrar la solicitud.' });
  }
};

exports.getAdoptions = async (_req, res) => {
  try {
    const adoptions = await Adoption.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ success: true, count: adoptions.length, data: adoptions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'No fue posible consultar las solicitudes.' });
  }
};
