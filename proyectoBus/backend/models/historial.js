// models/Historial.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // tu instancia de Sequelize

const Historial = sequelize.define('Historial', {
  origen: { type: DataTypes.STRING, allowNull: false },
  destino: { type: DataTypes.STRING, allowNull: false },
  resultado: { type: DataTypes.JSONB, allowNull: false },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = Historial;
