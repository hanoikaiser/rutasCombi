// Inicializar mapa
const map = L.map("map").setView([-16.409047, -71.537451], 13);

// Cargar tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

// Grupo de capas para rutas
const layerGroup = L.layerGroup().addTo(map);

// === Agregar Leaflet Draw ===
const drawControl = new L.Control.Draw({
  draw: {
    polygon: false,
    rectangle: false,
    circle: false,
    marker: false,
    circlemarker: false,
    polyline: { shapeOptions: { color: "blue" } }, // solo dibujar rutas
  },
  edit: { featureGroup: layerGroup }
});
map.addControl(drawControl);

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

    map.fitBounds(polyline.getBounds());
  });
}

// Al cargar la página
cargarRutas();

// Botón recargar
document.getElementById("recargarBtn").addEventListener("click", cargarRutas);

// === Capturar cuando el usuario dibuja una ruta ===
map.on(L.Draw.Event.CREATED, async (e) => {
  const layer = e.layer;
  const coords = layer.getLatLngs();

  // Preguntar nombre de la ruta
  const nombre = prompt("Ingrese el nombre de la ruta:");

  if (!nombre) {
    alert("Debe ingresar un nombre para la ruta");
    return;
  }

  // Transformar a formato backend
  const coordenadas = coords.map(c => ({ lat: c.lat, lng: c.lng }));

  // Guardar en backend
  const res = await fetch("http://localhost:3000/api/rutas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, coordenadas })
  });

  const data = await res.json();
  alert(data.mensaje);

  if (res.ok) {
    cargarRutas(); // Recargar mapa
  }
});
