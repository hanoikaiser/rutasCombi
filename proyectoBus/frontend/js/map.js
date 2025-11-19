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

// Variables
let puntos = [];
let lineaTemporal = null;

const API_URL = "http://localhost:3000/api/rutas";

// ===============================
// EVENTO: CLIC EN EL MAPA
// ===============================
map.on("click", (e) => {
  const { lat, lng } = e.latlng;

  puntos.push([lat, lng]);

  L.marker([lat, lng]).addTo(map);

  if (lineaTemporal) map.removeLayer(lineaTemporal);

  const color = document.getElementById("colorRuta").value;

  lineaTemporal = L.polyline(puntos, { color }).addTo(map);
});

// ===============================
// GUARDAR RUTA EN BASE DE DATOS
// ===============================
document.getElementById("formRuta").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreRuta").value.trim();
  const descripcion = document.getElementById("descripcionRuta").value.trim();
  const color = document.getElementById("colorRuta").value;

  if (!nombre) return alert("❗ Debes ingresar un nombre para la ruta.");
  if (puntos.length < 2) return alert("❗ Debes agregar al menos 2 puntos en el mapa.");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        descripcion,
        color,
        coordenadas: puntos
      })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Error al guardar ruta");

    alert("✅ Ruta guardada correctamente en PostgreSQL.");

    // Reset
    limpiarMapa();
    e.target.reset();

    // Actualizar lista de rutas
    cargarRutas();

  } catch (err) {
    console.error(err);
    alert("❌ Error conectando con el servidor.");
  }
});

// ===============================
// LIMPIAR MAPA
// ===============================
function limpiarMapa() {
  puntos = [];

  if (lineaTemporal) map.removeLayer(lineaTemporal);
  lineaTemporal = null;

  map.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });

  baseLayer.addTo(map);
}

document.getElementById("limpiarBtn").addEventListener("click", () => {
  limpiarMapa();
});

// ===============================
// CARGAR RUTAS DESDE POSTGRESQL
// ===============================
async function cargarRutas() {
  const lista = document.getElementById("rutasGuardadas");
  lista.innerHTML = "";

  try {
    const res = await fetch(API_URL);
    const rutas = await res.json();

    if (rutas.length === 0) {
      lista.innerHTML = "<li>No hay rutas registradas</li>";
      return;
    }

    rutas.forEach(r => {
      // Mostrar polilínea
      L.polyline(r.coordenadas, { color: r.color }).addTo(map)
        .bindPopup(`<b>${r.nombre}</b><br>${r.descripcion || ""}`);

      // Agregar a la lista
      const li = document.createElement("li");
      li.textContent = r.nombre;
      lista.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    alert("❌ Error cargando rutas.");
  }
}

document.getElementById("recargarBtn").addEventListener("click", () => {
  limpiarMapa();
  cargarRutas();
});

// ===============================
// Cargar rutas automáticamente al abrir
// ===============================
cargarRutas();
