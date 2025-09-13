const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Ruta', {
    linea: { type: DataTypes.STRING, allowNull: false },
    origen: { type: DataTypes.STRING, allowNull: false },
    destino: { type: DataTypes.STRING, allowNull: false },
    parada_intermedia: { type: DataTypes.STRING, allowNull: true },
    tiempo_estimado_min: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    timestamps: false
  });
};
