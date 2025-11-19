// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // si quieres restringir, pásale { origin: 'http://localhost:5500' } o similar
app.use(express.json({ limit: '2mb' }));

// --- Endpoints ---

// GET /api/rutas  -> listar todas las rutas
app.get('/api/rutas', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, descripcion, color, coordenadas FROM rutas ORDER BY id');
    return res.json(result.rows);
  } catch (err) {
    console.error('GET /api/rutas error', err);
    return res.status(500).json({ error: 'Error al obtener rutas' });
  }
});

// GET /api/rutas/:id -> obtener una ruta
app.get('/api/rutas/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('SELECT id, nombre, descripcion, color, coordenadas FROM rutas WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Ruta no encontrada' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /api/rutas/:id error', err);
    return res.status(500).json({ error: 'Error al obtener la ruta' });
  }
});

// POST /api/rutas  -> crear ruta nueva
app.post('/api/rutas', async (req, res) => {
  const { nombre, descripcion = null, color = '#4CAF50', coordenadas } = req.body;
  if (!nombre || !coordenadas) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: nombre y coordenadas' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO rutas (nombre, descripcion, color, coordenadas)
       VALUES ($1, $2, $3, $4) RETURNING id, nombre, descripcion, color, coordenadas`,
      [nombre, descripcion, color, JSON.stringify(coordenadas)]
    );
    return res.status(201).json({ mensaje: 'Ruta creada', ruta: result.rows[0] });
  } catch (err) {
    console.error('POST /api/rutas error', err);
    return res.status(500).json({ error: 'Error al crear la ruta' });
  }
});

// PUT /api/updateRuta/:id  -> actualizar coordenadas / meta de ruta
app.put('/api/updateRuta/:id', async (req, res) => {
  const id = req.params.id;
  const { nombre, descripcion, color, coordenadas } = req.body;

  if (!coordenadas && !nombre && !descripcion && !color) {
    return res.status(400).json({ error: 'Nada para actualizar' });
  }

  try {
    const updates = [];
    const values = [];
    let idx = 1;

    if (nombre) { updates.push(`nombre = $${idx++}`); values.push(nombre); }
    if (descripcion !== undefined) { updates.push(`descripcion = $${idx++}`); values.push(descripcion); }
    if (color) { updates.push(`color = $${idx++}`); values.push(color); }
    if (coordenadas) { updates.push(`coordenadas = $${idx++}`); values.push(JSON.stringify(coordenadas)); }

    updates.push(`updated_at = now()`);

    const sql = `UPDATE rutas SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, nombre, descripcion, color, coordenadas`;
    values.push(id);

    const result = await pool.query(sql, values);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Ruta no encontrada' });

    return res.json({ mensaje: 'Ruta actualizada', ruta: result.rows[0] });
  } catch (err) {
    console.error('PUT /api/updateRuta/:id error', err);
    return res.status(500).json({ error: 'Error al actualizar la ruta' });
  }
});

// DELETE /api/deleteRuta/:id -> borrar ruta
app.delete('/api/deleteRuta/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('DELETE FROM rutas WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Ruta no encontrada' });
    return res.json({ mensaje: 'Ruta eliminada' });
  } catch (err) {
    console.error('DELETE /api/deleteRuta/:id error', err);
    return res.status(500).json({ error: 'Error al eliminar la ruta' });
  }
});

// health
app.get('/health', (req, res) => res.json({ ok: true }));

// arrancar server
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
