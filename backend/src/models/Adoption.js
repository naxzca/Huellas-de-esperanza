const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Adoption = sequelize.define('Adoption', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  petId: { type: DataTypes.UUID, allowNull: false },
  petName: { type: DataTypes.STRING, allowNull: false },
  fullName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  occupation: { type: DataTypes.STRING, allowNull: false },
  housingType: { type: DataTypes.STRING, allowNull: false },
  petExperience: { type: DataTypes.TEXT, allowNull: false },
  adoptionReason: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Pendiente' }
});

module.exports = Adoption;
