const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { sequelize, Ruta, Usuario } = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Test
app.get('/', (req, res) => res.send('Servidor funcionando 🚀'));

// Registro
app.post('/api/registro', async (req, res) => {
  const { usuario, correo, password } = req.body;
  try {
    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) return res.status(409).json({ mensaje: 'Correo ya registrado' });

    const hash = await bcrypt.hash(password, 10);
    await Usuario.create({ usuario, correo, password_hash: hash });
    res.status(201).json({ mensaje: 'Usuario registrado' });
  } catch (e) {
    res.status(500).json({ error: 'Error en registro' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { correo, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) return res.status(401).json({ mensaje: 'Correo no registrado' });

    const valido = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    res.json({ mensaje: 'Login exitoso', usuario: usuario.usuario });
  } catch (e) {
    res.status(500).json({ error: 'Error en login' });
  }
});

// Consulta rutas
app.post('/api/ruta', async (req, res) => {
  const { origen, destino } = req.body;
  try {
    const rutas = await Ruta.findAll({ where: { origen, destino } });
    if (rutas.length === 0) return res.status(404).json({ mensaje: 'No hay ruta' });

    const tiempo_total = rutas.reduce((t, r) => t + r.tiempo_estimado_min, 0);
    res.json({
      ruta: rutas.map(r => ({ linea: r.linea, desde: r.origen, hasta: r.destino })),
      tiempo_estimado_min: tiempo_total
    });
  } catch (e) {
    res.status(500).json({ error: 'Error al consultar ruta' });
  }
});

app.listen(PORT, async () => {
  try {
    await sequelize.sync();
    console.log(`✅ Servidor en http://localhost:${PORT}`);
  } catch (e) {
    console.error('❌ Error DB:', e);
  }
});
