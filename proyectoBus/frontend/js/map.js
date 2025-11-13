// Inicialización del mapa centrado en Arequipa
const map = L.map('map').setView([-16.3989, -71.535], 13);

// Capa base de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Variables para controlar los puntos y rutas
let puntos = [];
let rutaActual = null;

// Evento: clic en el mapa → agregar punto
map.on('click', function (e) {
  const { lat, lng } = e.latlng;
  puntos.push([lat, lng]);

  // Marcador en el mapa
  L.marker([lat, lng]).addTo(map);

  // Dibujar línea
  if (rutaActual) {
    map.removeLayer(rutaActual);
  }
  rutaActual = L.polyline(puntos, { color: 'blue' }).addTo(map);
});

// Evento: guardar ruta
document.getElementById('formRuta').addEventListener('submit', function (e) {
  e.preventDefault();
  const nombre = document.getElementById('nombreRuta').value.trim();

  if (!nombre || puntos.length < 2) {
    alert('Debes ingresar un nombre y al menos 2 puntos para guardar la ruta.');
    return;
  }

  const nuevaRuta = {
    nombre: nombre,
    coordenadas: puntos
  };

  // Simulamos guardado en localStorage
  let rutasGuardadas = JSON.parse(localStorage.getItem('rutas')) || [];
  rutasGuardadas.push(nuevaRuta);
  localStorage.setItem('rutas', JSON.stringify(rutasGuardadas));

  alert('✅ Ruta guardada correctamente.');
  document.getElementById('formRuta').reset();
  puntos = [];
  if (rutaActual) map.removeLayer(rutaActual);
  rutaActual = null;
});

// Evento: limpiar mapa
document.getElementById('limpiarBtn').addEventListener('click', function () {
  puntos = [];
  if (rutaActual) {
    map.removeLayer(rutaActual);
    rutaActual = null;
  }
  map.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
});

// Evento: recargar rutas guardadas
document.getElementById('recargarBtn').addEventListener('click', function () {
  const rutasGuardadas = JSON.parse(localStorage.getItem('rutas')) || [];

  // Limpiamos el mapa antes de dibujar
  map.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  rutasGuardadas.forEach(ruta => {
    L.polyline(ruta.coordenadas, { color: 'green' }).addTo(map)
      .bindPopup(`<b>${ruta.nombre}</b>`);
  });

  alert('🔄 Rutas recargadas correctamente.');
});
