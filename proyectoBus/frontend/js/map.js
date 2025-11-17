// ===============================
// CONFIGURACIÓN DEL MAPA
// ===============================
const map = L.map('map').setView([-16.3989, -71.535], 13);

// Capa base
const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
});
baseLayer.addTo(map);

// Variables para control de rutas
let puntos = [];
let lineaTemporal = null;

// ===============================
// EVENTO: CLIC EN EL MAPA
// ===============================
map.on('click', (e) => {
  const { lat, lng } = e.latlng;

  puntos.push([lat, lng]);

  // Marcador
  L.marker([lat, lng]).addTo(map);

  // Línea temporal
  if (lineaTemporal) map.removeLayer(lineaTemporal);

  lineaTemporal = L.polyline(puntos, { color: 'blue' }).addTo(map);
});

// ===============================
// GUARDAR RUTA (localStorage por ahora)
// ===============================
document.getElementById('formRuta').addEventListener('submit', (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombreRuta').value.trim();

  if (!nombre) {
    alert("❗ Debes ingresar un nombre para la ruta.");
    return;
  }

  if (puntos.length < 2) {
    alert("❗ La ruta necesita al menos 2 puntos.");
    return;
  }

  const ruta = {
    id: Date.now(),
    nombre,
    coordenadas: puntos
  };

  let lista = JSON.parse(localStorage.getItem('rutas')) || [];
  lista.push(ruta);
  localStorage.setItem('rutas', JSON.stringify(lista));

  alert("✅ Ruta almacenada correctamente.");

  // Reset
  puntos = [];
  if (lineaTemporal) map.removeLayer(lineaTemporal);
  lineaTemporal = null;
  e.target.reset();
});

// ===============================
// LIMPIAR EL MAPA
// ===============================
document.getElementById('limpiarBtn').addEventListener('click', () => {
  limpiarMapa();
});

function limpiarMapa() {
  puntos = [];

  if (lineaTemporal) map.removeLayer(lineaTemporal);
  lineaTemporal = null;

  map.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });

  // Reagregamos capa base
  baseLayer.addTo(map);
}

// ===============================
// RECARGAR RUTAS GUARDADAS
// ===============================
document.getElementById('recargarBtn').addEventListener('click', () => {
  limpiarMapa();

  const rutas = JSON.parse(localStorage.getItem('rutas')) || [];

  rutas.forEach(r => {
    L.polyline(r.coordenadas, { color: 'green' })
      .addTo(map)
      .bindPopup(`<b>${r.nombre}</b>`);
  });

  if (rutas.length === 0) {
    alert("⚠️ No hay rutas guardadas.");
  } else {
    alert("🔄 Rutas cargadas.");
  }
});
