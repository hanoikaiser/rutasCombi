const map = L.map('map').setView([-16.3989, -71.535], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let rutas = [];
let rutaActual = null;
let polyline = null;
let drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  draw: {
    polygon: false,
    marker: false,
    circle: false,
    rectangle: false,
    circlemarker: false,
    polyline: true
  },
  edit: false
});

// Editar ruta
document.getElementById('editarRutaBtn').addEventListener('click', () => {
  if (!rutaActual) return alert('Selecciona una ruta primero.');
  map.addControl(drawControl);
  document.getElementById('guardarRutaBtn').disabled = false;
  alert('Dibuja la nueva ruta sobre el mapa.');
});

map.on(L.Draw.Event.CREATED, (event) => {
  drawnItems.clearLayers();
  const layer = event.layer;
  drawnItems.addLayer(layer);
});

// Cargar rutas
async function cargarRutas() {
  layerGroup.clearLayers();

  const response = await fetch("http://localhost:3000/api/rutas");
  const rutas = await response.json();

  const colores = ["blue", "red", "green", "orange", "purple"];

  rutas.forEach((ruta, i) => {
    const coords = ruta.coordenadas.map(p => [p.lat, p.lng]);
    const color = colores[i % colores.length];

    // --- Dibujar la línea ---
    const polyline = L.polyline(coords, { color, weight: 4 }).addTo(layerGroup);

    // --- NUEVO: Íconos personalizados de inicio y fin ---
    const iconoInicio = L.icon({
      iconUrl: 'img/inicio.png', // Asegúrate de tener esta imagen en /frontend/img/
      iconSize: [32, 32],
    });

    const iconoFin = L.icon({
      iconUrl: 'img/fin.png', // También en /frontend/img/
      iconSize: [32, 32],
    });

    // Agregar los marcadores de inicio y fin
    L.marker(coords[0], { icon: iconoInicio })
      .addTo(layerGroup)
      .bindPopup("Inicio: " + ruta.nombre);

    L.marker(coords[coords.length - 1], { icon: iconoFin })
      .addTo(layerGroup)
      .bindPopup("Fin: " + ruta.nombre);

    // --- Ajustar el mapa a la ruta ---
    map.fitBounds(polyline.getBounds());

    // --- Permitir clic para editar ---
    polyline.on("click", () => {
      rutaEnEdicion = ruta.id;
      puntosRuta = coords;
      tempGroup.clearLayers();

      coords.forEach((p, idx) => {
        L.marker(p).addTo(tempGroup).bindPopup(`Punto ${idx + 1}`);
      });
      L.polyline(coords, { color: "gray", dashArray: "5,5" }).addTo(tempGroup);

      alert(`Editando la ruta: ${ruta.nombre}`);
    });
  });
}


// Mostrar ruta seleccionada
document.getElementById('rutasSelect').addEventListener('change', (e) => {
  const id = e.target.value;
  if (polyline) map.removeLayer(polyline);
  if (!id) {
    rutaActual = null;
    document.getElementById('guardarRutaBtn').disabled = true;
    document.getElementById('eliminarRutaBtn').disabled = true;
    return;
  }

  const ruta = rutas.find(r => r.id == id);
  const coords = JSON.parse(ruta.coordenadas);
  polyline = L.polyline(coords, { color: 'blue' }).addTo(map);
  map.fitBounds(polyline.getBounds());
  rutaActual = ruta;

  document.getElementById('eliminarRutaBtn').disabled = false;
});

// Guardar nueva ruta
document.getElementById('guardarRutaBtn').addEventListener('click', async () => {
  if (!rutaActual) return alert('Primero selecciona una ruta.');
  if (drawnItems.getLayers().length === 0) return alert('Dibuja una nueva ruta primero.');

  const nuevaRuta = drawnItems.getLayers()[0];
  const latlngs = nuevaRuta.getLatLngs().map(ll => [ll.lat, ll.lng]);

  const res = await fetch(`http://localhost:3000/api/updateRuta/${rutaActual.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordenadas: latlngs })
  });

  if (res.ok) {
    alert('Ruta actualizada correctamente.');
    drawnItems.clearLayers();
    map.removeControl(drawControl);
    document.getElementById('guardarRutaBtn').disabled = true;
    cargarRutas();
  } else {
    alert('Error al actualizar la ruta.');
  }
});

// 🗑️ Eliminar ruta
document.getElementById('eliminarRutaBtn').addEventListener('click', async () => {
  if (!rutaActual) return alert('Selecciona una ruta para eliminar.');

  const confirmar = confirm(`¿Seguro que deseas eliminar la ruta "${rutaActual.nombre}"?`);
  if (!confirmar) return;

  const res = await fetch(`http://localhost:3000/api/deleteRuta/${rutaActual.id}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    alert('Ruta eliminada correctamente.');
    if (polyline) map.removeLayer(polyline);
    rutaActual = null;
    document.getElementById('guardarRutaBtn').disabled = true;
    document.getElementById('eliminarRutaBtn').disabled = true;
    cargarRutas();
  } else {
    alert('Error al eliminar la ruta.');
  }
});

// 🗂️ Cargar rutas en el panel lateral
async function cargarRutas() {
  const lista = document.getElementById("listaRutas");
  lista.innerHTML = "<li>Cargando rutas...</li>";

  try {
    const res = await fetch("/api/rutas");
    const rutas = await res.json();

    lista.innerHTML = "";

    rutas.forEach((ruta) => {
      const item = document.createElement("li");
      item.textContent = ruta.nombre;
      item.onclick = () => mostrarRutaEnMapa(ruta);
      lista.appendChild(item);
    });
  } catch (error) {
    console.error("Error al cargar rutas:", error);
    lista.innerHTML = "<li>Error al cargar rutas</li>";
  }
}

// 🗺️ Mostrar una ruta en el mapa al seleccionarla
function mostrarRutaEnMapa(ruta) {
  if (!ruta.coordenadas) return;
  const coords = JSON.parse(ruta.coordenadas);
  const polyline = L.polyline(coords, { color: 'blue' }).addTo(map);
  map.fitBounds(polyline.getBounds());
}

// Inicializar al cargar
window.addEventListener("DOMContentLoaded", cargarRutas);
document.getElementById("recargarBtn").addEventListener("click", cargarRutas);


cargarRutas();
