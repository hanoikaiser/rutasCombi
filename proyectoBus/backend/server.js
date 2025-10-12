import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexión con PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "rutasdb",
  password: "2521", // 🔑 tu contraseña
  port: 5432,
});

// -------------------- RUTAS --------------------

// Obtener todas las rutas
app.get("/api/rutas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM rutas");
    const rutas = result.rows.map(r => ({
      id: r.id,
      nombre: r.nombre,
      coordenadas: r.coordenadas, // JSON[]
    }));
    res.json(rutas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener rutas" });
  }
});

// Insertar nueva ruta
app.post("/api/rutas", async (req, res) => {
  const { nombre, coordenadas } = req.body;

  try {
    await pool.query(
      "INSERT INTO rutas (nombre, coordenadas) VALUES ($1, $2)",
      [nombre, JSON.stringify(coordenadas)]
    );
    res.json({ mensaje: "Ruta agregada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al insertar ruta" });
  }
});

// -------------------- NUEVO: Editar ruta --------------------
app.put("/api/rutas/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, coordenadas } = req.body;

  try {
    await pool.query(
      "UPDATE rutas SET nombre = $1, coordenadas = $2 WHERE id = $3",
      [nombre, JSON.stringify(coordenadas), id]
    );
    res.json({ mensaje: "Ruta actualizada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al actualizar ruta" });
  }
});

app.delete("/api/rutas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM rutas WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ mensaje: "Ruta no encontrada" });
    }

    res.json({ mensaje: "Ruta eliminada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al eliminar la ruta" });
  }
});

app.delete('/api/deleteRuta/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM rutas WHERE id = $1', [id]);
    res.status(200).json({ message: 'Ruta eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la ruta' });
  }
});

// ------------------------------------------------------------

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
