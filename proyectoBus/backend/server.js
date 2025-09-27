import express from "express";
import pkg from "pg";
import cors from "cors";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "rutasdb",
  password: "2521",
  port: 5432,
});

// Endpoint para obtener todas las rutas
app.get("/api/rutas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM rutas");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error en la BD");
  }
});

app.listen(3000, () => {
  console.log("✅ Servidor corriendo en http://localhost:3000");
});

app.post("/api/rutas", async (req, res) => {
  try {
    const { nombre, coordenadas } = req.body;

    if (!nombre || !coordenadas || coordenadas.length === 0) {
      return res.status(400).json({ mensaje: "Faltan datos de la ruta" });
    }

    const result = await pool.query(
      "INSERT INTO rutas (nombre, coordenadas) VALUES ($1, $2) RETURNING *",
      [nombre, JSON.stringify(coordenadas)]
    );

    res.json({ mensaje: "Ruta creada con éxito", ruta: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al guardar la ruta" });
  }
});
