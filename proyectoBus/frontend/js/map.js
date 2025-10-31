// =======================
// CONFIGURACIÓN DEL MAPA
// =======================
const map = L.map('map').setView([-16.3989, -71.535], 13); // Centro de Arequipa

// Capa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// =======================
// VARIABLES GLOBALES
// =======================
let rutas = []; // Lista de rutas disponibles
let capaRutaActual = null; // Capa actualmente mostrada
let controlEdicion = null; // Control de dibujo Leaflet
let rutaSeleccionada = null; // Ruta activa

// =======================
// FUNCIONES AUXILIARES
// =======================

// Simula la carga de rutas desde la base de datos o API
async function cargarRutas() {
  try {
    // ⚠️ En producción, cambia esta línea por tu endpoint real:
    // Ejemplo: const res = await fetch("/api/rutas");
    // const data = await res.json();

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

// Llena el panel lateral
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

// Llena el combo select
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

// Muestra la ruta en el mapa
function mostrarRuta(ruta) {
  if (capaRutaActual) map.removeLayer(capaRutaActual);

  capaRutaActual = L.polyline(ruta.coordenadas, {
    color: ruta.color || "#007bff",
    weight: 5
  }).addTo(map);

  map.fitBounds(capaRutaActual.getBounds());
}

// Seleccionar una ruta desde lista o combo
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

// Activar modo edición
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

// Guardar cambios
function guardarRuta() {
  if (!rutaSeleccionada || !capaRutaActual) return;

  const coords = capaRutaActual.getLatLngs().map(p => [p.lat, p.lng]);
  rutaSeleccionada.coordenadas = coords;

  // Aquí puedes hacer un PUT o POST al backend
  console.log("💾 Ruta actualizada:", rutaSeleccionada);

  document.getElementById("guardarRutaBtn").disabled = true;
  if (controlEdicion) {
    map.removeControl(controlEdicion);
    controlEdicion = null;
  }
  alert("✅ Cambios guardados correctamente");
}

// Eliminar ruta
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
// EVENTOS
// =======================
document.getElementById("rutasSelect").addEventListener("change", e => {
  const id = e.target.value;
  if (id) seleccionarRuta(id);
});

document.getElementById("editarRutaBtn").addEventListener("click", editarRuta);
document.getElementById("guardarRutaBtn").addEventListener("click", guardarRuta);
document.getElementById("eliminarRutaBtn").addEventListener("click", eliminarRuta);
document.getElementById("recargarBtn").addEventListener("click", cargarRutas);

// =======================
// INICIALIZACIÓN
// =======================
cargarRutas();
