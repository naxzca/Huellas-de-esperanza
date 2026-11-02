const app = require('./src/app');
const sequelize = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log(' Conexión a la base de datos establecida.');

    await sequelize.sync({ force: false });

    // Guardar la instancia del servidor HTTP mantiene el proceso escuchando
    const server = app.listen(PORT, () => {
      console.log(` Servidor corriendo en http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      console.error('Error en el servidor HTTP:', err);
    });

  } catch (error) {
    console.error(' Error en la base de datos:', error);
  }
}

startServer();