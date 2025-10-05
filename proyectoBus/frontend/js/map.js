const map = L.map("map").setView([-16.409047, -71.537451], 13);

// Cargar tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

// Grupo de capas para mostrar rutas guardadas
const layerGroup = L.layerGroup().addTo(map);

// Grupo temporal para construir/editar rutas
const tempGroup = L.layerGroup().addTo(map);

// Lista temporal de puntos
let puntosRuta = [];
let rutaEnEdicion = null; // Guardar ID de ruta si estamos editando

// Función para cargar rutas desde el backend
async function cargarRutas() {
  layerGroup.clearLayers();

  const response = await fetch("http://localhost:3000/api/rutas");
  const rutas = await response.json();

  const colores = ["blue", "red", "green", "orange", "purple"];

  rutas.forEach((ruta, i) => {
    const coords = ruta.coordenadas.map(p => [p.lat, p.lng]);
    const color = colores[i % colores.length];

    const polyline = L.polyline(coords, { color, weight: 4 }).addTo(layerGroup);

    L.marker(coords[0]).addTo(layerGroup).bindPopup("Inicio: " + ruta.nombre);
    L.marker(coords[coords.length - 1]).addTo(layerGroup).bindPopup("Fin: " + ruta.nombre);

    // Ajustar el mapa
    map.fitBounds(polyline.getBounds());

    // --- NUEVO: clic en ruta para editar ---
    polyline.on("click", () => {
      rutaEnEdicion = ruta.id; // Guardamos ID
      puntosRuta = coords;     // Cargamos sus puntos
      tempGroup.clearLayers();

      // Dibujar puntos como edición
      coords.forEach((p, idx) => {
        L.marker(p).addTo(tempGroup).bindPopup(`Punto ${idx + 1}`);
      });
      L.polyline(coords, { color: "gray", dashArray: "5,5" }).addTo(tempGroup);

      alert(`Editando la ruta: ${ruta.nombre}`);
    });
  });
}

// Inicial
cargarRutas();

// Botón recargar
document.getElementById("recargarBtn").addEventListener("click", cargarRutas);

// --- Clic en mapa para añadir puntos ---
map.on("click", (e) => {
  const { lat, lng } = e.latlng;

  puntosRuta.push([lat, lng]);

  // Dibujar en modo edición
  L.marker([lat, lng]).addTo(tempGroup).bindPopup(`Punto ${puntosRuta.length}`);
  if (puntosRuta.length > 1) {
    L.polyline(puntosRuta, { color: "gray", dashArray: "5,5" }).addTo(tempGroup);
  }
});

// Botón limpiar
document.getElementById("limpiarBtn").addEventListener("click", () => {
  puntosRuta = [];
  rutaEnEdicion = null; // Cancelamos edición si estaba activa
  tempGroup.clearLayers();
  alert("Ruta en edición limpiada.");
});

// Formulario guardar
document.getElementById("formRuta").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreRuta").value;

  if (puntosRuta.length < 2) {
    alert("Debes marcar al menos 2 puntos en el mapa.");
    return;
  }

  const coordenadas = puntosRuta.map(([lat, lng]) => ({ lat, lng }));

  let res;
  if (rutaEnEdicion) {
    // --- Actualizar ruta existente ---
    res = await fetch(`http://localhost:3000/api/rutas/${rutaEnEdicion}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, coordenadas })
    });
  } else {
    // --- Crear nueva ruta ---
    res = await fetch("http://localhost:3000/api/rutas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, coordenadas })
    });
  }

  const data = await res.json();
  alert(data.mensaje);

  if (res.ok) {
    puntosRuta = [];
    rutaEnEdicion = null;
    tempGroup.clearLayers();
    cargarRutas();
  }
});
