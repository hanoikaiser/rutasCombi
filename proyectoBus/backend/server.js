const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Ruta de ejemplo (simulada)
app.post('/api/ruta', (req, res) => {
  const { origen, destino } = req.body;

  // Respuesta simulada
  if (origen && destino) {
    res.json({
      mensaje: 'Ruta encontrada',
      ruta: [
        { linea: 'Combi A', desde: 'Av. Parra', hasta: 'Av. Principal' },
        { linea: 'Combi B', desde: 'Av. Principal', hasta: 'Mall Aventura' }
      ]
    });
  } else {
    res.status(400).json({ mensaje: 'Debe enviar origen y destino' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
