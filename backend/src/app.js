const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas principales
const petRoutes = require('./routes/pet.routes');
const authRoutes = require('./routes/auth.routes');

app.use('/api/pets', petRoutes);
app.use('/api/auth', authRoutes); // <- Nueva línea

module.exports = app;