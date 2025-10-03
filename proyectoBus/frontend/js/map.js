const map = L.map("map").setView([-16.409047, -71.537451], 13);

// Cargar tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

// Grupo de capas para poder limpiar rutas fácilmente
const layerGroup = L.layerGroup().addTo(map);

// Lista temporal para construir la ruta
let puntosRuta = [];

// Función para cargar rutas desde el backend
async function cargarRutas() {
  layerGroup.clearLayers(); // Limpiar rutas previas

  const response = await fetch("http://localhost:3000/api/rutas");
  const rutas = await response.json();

  const colores = ["blue", "red", "green", "orange", "purple"];

  rutas.forEach((ruta, i) => {
    const coords = ruta.coordenadas.map(p => [p.lat, p.lng]);
    const color = colores[i % colores.length];

    const polyline = L.polyline(coords, { color, weight: 4 }).addTo(layerGroup);

    L.marker(coords[0]).addTo(layerGroup).bindPopup("Inicio: " + ruta.nombre);
    L.marker(coords[coords.length - 1]).addTo(layerGroup).bindPopup("Fin: " + ruta.nombre);

    // Ajustar el mapa para mostrar toda la ruta
    map.fitBounds(polyline.getBounds());
  });
}

// Llamar al cargar la página
cargarRutas();

// Botón recargar
document.getElementById("recargarBtn").addEventListener("click", cargarRutas);

// --- NUEVO: construir rutas con clics ---
map.on("click", (e) => {
  const { lat, lng } = e.latlng;

  puntosRuta.push([lat, lng]);

  // Dibujar punto en el mapa
  L.marker([lat, lng]).addTo(layerGroup).bindPopup(`Punto ${puntosRuta.length}`);

  // Dibujar línea provisional
  if (puntosRuta.length > 1) {
    L.polyline(puntosRuta, { color: "gray", dashArray: "5,5" }).addTo(layerGroup);
  }
});

// Manejo del formulario
document.getElementById("formRuta").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreRuta").value;

  if (puntosRuta.length < 2) {
    alert("Debes marcar al menos 2 puntos en el mapa para crear la ruta.");
    return;
  }

  // Convertir puntosRuta en el formato {lat, lng}
  const coordenadas = puntosRuta.map(([lat, lng]) => ({ lat, lng }));

  const res = await fetch("http://localhost:3000/api/rutas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, coordenadas })
  });

  const data = await res.json();
  alert(data.mensaje);

  if (res.ok) {
    puntosRuta = []; // Reiniciar lista
    cargarRutas();   // Recargar rutas del servidor
  }
});
