const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ===============================
// TEST
// ===============================
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// ===============================
// GUARDAR RUTA
// ===============================
app.post("/api/rutas", async (req, res) => {
  try {
    const { nombre, descripcion, color, coordenadas } = req.body;

    if (!nombre || !color || !coordenadas) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    await pool.query(
      "INSERT INTO rutas (nombre, descripcion, color, coordenadas) VALUES ($1,$2,$3,$4)",
      [nombre, descripcion, color, JSON.stringify(coordenadas)]
    );

    res.json({ mensaje: "Ruta guardada correctamente" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar ruta" });
  }
});

// ===============================
// OBTENER TODAS LAS RUTAS
// ===============================
app.get("/api/rutas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM rutas");

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener rutas" });
  }
});

// ===============================
// INICIAR SERVIDOR
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Servidor funcionando en http://localhost:${PORT}`);
});
