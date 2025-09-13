const { Sequelize } = require('sequelize');
const RutaModel = require('./models/Ruta');
const UsuarioModel = require('./models/Usuario');

// ⚡ Cambia los valores según tu configuración
const sequelize = new Sequelize('rutasdb', 'postgres', '2521', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

const Ruta = RutaModel(sequelize);
const Usuario = UsuarioModel(sequelize);

module.exports = { sequelize, Ruta, Usuario };
