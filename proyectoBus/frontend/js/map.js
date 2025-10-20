const map = L.map('map').setView([-16.3989, -71.535], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let rutas = [];
let rutaActual = null;
let polyline = null;
let drawnItems = new L.FeatureGroup();
let layerGroup = new L.FeatureGroup();
let tempGroup = new L.FeatureGroup();

map.addLayer(drawnItems);
map.addLayer(layerGroup);
map.addLayer(tempGroup);

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
document.getElementById('editarRutaBtn')?.addEventListener('click', () => {
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

// 🗺️ Cargar y mostrar rutas
async function cargarRutas() {
  const lista = document.getElementById("listaRutas");
  if (lista) {
    lista.innerHTML = "<li>Cargando rutas...</li>";
  }

  try {
    const res = await fetch("http://localhost:3000/api/rutas");
    if (!res.ok) throw new Error("Error al cargar rutas");
    rutas = await res.json();

    layerGroup.clearLayers();
    if (lista) lista.innerHTML = "";

    const colores = ["blue", "red", "green", "orange", "purple"];

    rutas.forEach((ruta, i) => {
      const coords = Array.isArray(ruta.coordenadas)
        ? ruta.coordenadas
        : JSON.parse(ruta.coordenadas || "[]");

      if (!coords.length) return;

      const color = colores[i % colores.length];
      const polyline = L.polyline(coords, { color, weight: 4 }).addTo(layerGroup);

      const iconoInicio = L.icon({
        iconUrl: 'img/inicio.png',
        iconSize: [32, 32],
      });

      const iconoFin = L.icon({
        iconUrl: 'img/fin.png',
        iconSize: [32, 32],
      });

      L.marker(coords[0], { icon: iconoInicio })
        .addTo(layerGroup)
        .bindPopup(`Inicio: ${ruta.nombre}`);

      L.marker(coords[coords.length - 1], { icon: iconoFin })
        .addTo(layerGroup)
        .bindPopup(`Fin: ${ruta.nombre}`);

      polyline.on("click", () => {
        rutaActual = ruta;
        tempGroup.clearLayers();
        coords.forEach((p, idx) => {
          L.marker(p).addTo(tempGroup).bindPopup(`Punto ${idx + 1}`);
        });
        L.polyline(coords, { color: "gray", dashArray: "5,5" }).addTo(tempGroup);
        alert(`Editando: ${ruta.nombre}`);
      });

      if (lista) {
        const item = document.createElement("li");
        item.textContent = ruta.nombre;
        item.onclick = () => {
          map.fitBounds(polyline.getBounds());
          rutaActual = ruta;
        };
        lista.appendChild(item);
      }
    });

  } catch (error) {
    console.error("Error al cargar rutas:", error);
    if (lista) lista.innerHTML = "<li>Error al cargar rutas</li>";
  }
}

// Mostrar ruta seleccionada
document.getElementById('rutasSelect')?.addEventListener('change', (e) => {
  const id = e.target.value;
  if (polyline) map.removeLayer(polyline);
  if (!id) {
    rutaActual = null;
    document.getElementById('guardarRutaBtn').disabled = true;
    document.getElementById('eliminarRutaBtn').disabled = true;
    return;
  }

  const ruta = rutas.find(r => r.id == id);
  if (!ruta) return;

  const coords = Array.isArray(ruta.coordenadas) ? ruta.coordenadas : JSON.parse(ruta.coordenadas);
  polyline = L.polyline(coords, { color: 'blue' }).addTo(map);
  map.fitBounds(polyline.getBounds());
  rutaActual = ruta;

  document.getElementById('eliminarRutaBtn').disabled = false;
});

// Guardar ruta editada
document.getElementById('guardarRutaBtn')?.addEventListener('click', async () => {
  if (!rutaActual) return alert('Primero selecciona una ruta.');
  if (drawnItems.getLayers().length === 0) return alert('Dibuja una nueva ruta primero.');

  const nuevaRuta = drawnItems.getLayers()[0];
  const latlngs = nuevaRuta.getLatLngs().map(ll => [ll.lat, ll.lng]);

  try {
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
  } catch (error) {
    alert('Error de red al actualizar la ruta.');
  }
});

// Eliminar ruta
document.getElementById('eliminarRutaBtn')?.addEventListener('click', async () => {
  if (!rutaActual) return alert('Selecciona una ruta para eliminar.');

  const confirmar = confirm(`¿Seguro que deseas eliminar la ruta "${rutaActual.nombre}"?`);
  if (!confirmar) return;

  try {
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
  } catch (error) {
    alert('Error de red al eliminar la ruta.');
  }
});

// Inicial
//Ejecutar codigo para la localizacion en el mapa
//Editar las rutas de los vehiculos
//Agregar nuevas rutas por medio de un mapa interactivo en vez de coordenadas
//Previsualizar las rutas en un mapa para confirmar sus paramteros
//Planificar rutas respecto a los destinos mas concurridos
//Fijar puntos intermedios para abordar distintos vehiculos