// =======================
// CONFIGURACIÓN DEL MAPA
// =======================
const map = L.map('map').setView([-16.3989, -71.535], 13); // Centro de Arequipa

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// =======================
// VARIABLES GLOBALES
// =======================
let rutas = [];
let capaRutaActual = null;
let controlEdicion = null;
let rutaSeleccionada = null;
let capaNuevaRuta = null;

// =======================
// FUNCIONES AUXILIARES
// =======================
async function cargarRutas() {
  try {
    const data = [
      {
        id: 1,
        nombre: "Ruta 1 - Paucarpata - Cercado",
        color: "#007bff",
        coordenadas: [
          [-16.406, -71.535],
          [-16.402, -71.530],
          [-16.398, -71.528],
          [-16.395, -71.531]
        ]
      },
      {
        id: 2,
        nombre: "Ruta 2 - Cerro Colorado - Yanahuara",
        color: "#dc3545",
        coordenadas: [
          [-16.361, -71.565],
          [-16.365, -71.550],
          [-16.370, -71.540],
          [-16.380, -71.532]
        ]
      }
    ];

    rutas = data;
    actualizarListaRutas();
    actualizarSelectRutas();
    console.log("✅ Rutas cargadas correctamente");
  } catch (error) {
    console.error("❌ Error al cargar rutas:", error);
  }
}

function actualizarListaRutas() {
  const lista = document.getElementById("listaRutas");
  lista.innerHTML = "";
  rutas.forEach(ruta => {
    const li = document.createElement("li");
    li.textContent = ruta.nombre;
    li.onclick = () => seleccionarRuta(ruta.id);
    lista.appendChild(li);
  });
}

function actualizarSelectRutas() {
  const select = document.getElementById("rutasSelect");
  select.innerHTML = '<option value="">Seleccione una ruta</option>';
  rutas.forEach(ruta => {
    const opt = document.createElement("option");
    opt.value = ruta.id;
    opt.textContent = ruta.nombre;
    select.appendChild(opt);
  });
}

function mostrarRuta(ruta) {
  if (capaRutaActual) map.removeLayer(capaRutaActual);

  capaRutaActual = L.polyline(ruta.coordenadas, {
    color: ruta.color || "#007bff",
    weight: 5
  }).addTo(map);

  map.fitBounds(capaRutaActual.getBounds());
}

function seleccionarRuta(id) {
  const ruta = rutas.find(r => r.id == id);
  if (!ruta) return;

  rutaSeleccionada = ruta;
  mostrarRuta(ruta);

  document.getElementById("rutasSelect").value = ruta.id;
  document.getElementById("editarRutaBtn").disabled = false;
  document.getElementById("eliminarRutaBtn").disabled = false;
  document.getElementById("guardarRutaBtn").disabled = true;
}

function editarRuta() {
  if (!rutaSeleccionada) return;

  if (controlEdicion) map.removeControl(controlEdicion);

  controlEdicion = new L.Control.Draw({
    edit: {
      featureGroup: L.featureGroup([capaRutaActual]),
      remove: false
    },
    draw: false
  });

  map.addControl(controlEdicion);
  document.getElementById("guardarRutaBtn").disabled = false;
  console.log("✏️ Modo edición activado");
}

function guardarRuta() {
  if (!rutaSeleccionada || !capaRutaActual) return;

  const coords = capaRutaActual.getLatLngs().map(p => [p.lat, p.lng]);
  rutaSeleccionada.coordenadas = coords;

  console.log("💾 Ruta actualizada:", rutaSeleccionada);

  document.getElementById("guardarRutaBtn").disabled = true;
  if (controlEdicion) {
    map.removeControl(controlEdicion);
    controlEdicion = null;
  }
  alert("✅ Cambios guardados correctamente");
}

function eliminarRuta() {
  if (!rutaSeleccionada) return;

  if (!confirm(`¿Seguro que deseas eliminar "${rutaSeleccionada.nombre}"?`)) return;

  rutas = rutas.filter(r => r.id !== rutaSeleccionada.id);
  if (capaRutaActual) map.removeLayer(capaRutaActual);

  actualizarListaRutas();
  actualizarSelectRutas();

  document.getElementById("editarRutaBtn").disabled = true;
  document.getElementById("eliminarRutaBtn").disabled = true;
  document.getElementById("guardarRutaBtn").disabled = true;

  console.log("🗑️ Ruta eliminada:", rutaSeleccionada.nombre);
  alert("✅ Ruta eliminada correctamente");
  rutaSeleccionada = null;
}

// =======================
// CREAR NUEVA RUTA
// =======================
function crearNuevaRuta() {
  if (controlEdicion) map.removeControl(controlEdicion);

  const drawControl = new L.Control.Draw({
    draw: {
      polyline: true,
      polygon: false,
      circle: false,
      rectangle: false,
      marker: false,
      circlemarker: false
    },
    edit: false
  });

  map.addControl(drawControl);

  alert("🟢 Dibuja una nueva ruta sobre el mapa. Haz clic en cada punto y luego en 'Finalizar dibujo'.");

  map.once(L.Draw.Event.CREATED, (event) => {
    capaNuevaRuta = event.layer;
    map.addLayer(capaNuevaRuta);

    const nombre = prompt("📝 Nombre de la nueva ruta:");
    const color = prompt("🎨 Color en formato HEX (ejemplo: #ff8800):", "#28a745");

    if (!nombre) {
      alert("❌ No se asignó nombre. Ruta descartada.");
      map.removeLayer(capaNuevaRuta);
      return;
    }

    const nuevaRuta = {
      id: rutas.length + 1,
      nombre,
      color,
      coordenadas: capaNuevaRuta.getLatLngs().map(p => [p.lat, p.lng])
    };

    rutas.push(nuevaRuta);
    actualizarListaRutas();
    actualizarSelectRutas();
    alert("✅ Nueva ruta creada correctamente.");
    map.removeControl(drawControl);
  });
}

// =======================
// EVENTOS
// =======================
document.getElementById("rutasSelect").addEventListener("change", e => {
  const id = e.target.value;
  if (id) seleccionarRuta(id);
});

document.getElementById("editarRutaBtn").addEventListener("click", editarRuta);
document.getElementById("guardarRutaBtn").addEventListener("click", guardarRuta);
document.getElementById("eliminarRutaBtn").addEventListener("click", eliminarRuta);
document.getElementById("nuevaRutaBtn").addEventListener("click", crearNuevaRuta);
document.getElementById("recargarBtn").addEventListener("click", cargarRutas);

// =======================
// INICIALIZACIÓN
// =======================
cargarRutas();
