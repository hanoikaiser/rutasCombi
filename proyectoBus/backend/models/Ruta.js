const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Rutas', {
    linea: { type: DataTypes.STRING, allowNull: false },
    origen: { type: DataTypes.STRING, allowNull: false },
    destino: { type: DataTypes.STRING, allowNull: false },
    parada_intermedia: { type: DataTypes.STRING, allowNull: true },
    tiempo_estimado: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    timestamps: false
  });
};
