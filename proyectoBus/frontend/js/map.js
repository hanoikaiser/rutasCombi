const map = L.map("map").setView([-16.409047, -71.537451], 13);

// Tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

const layerGroup = L.layerGroup().addTo(map);
const tempGroup = L.layerGroup().addTo(map);

let puntosRuta = [];
let rutaEnEdicion = null;

// Cargar rutas desde backend
async function cargarRutas() {
  layerGroup.clearLayers();
  const response = await fetch("http://localhost:3000/api/rutas");
  const rutas = await response.json();

  const colores = ["blue", "red", "green", "orange", "purple"];
  const bounds = [];

  rutas.forEach((ruta, i) => {
    const coordsArray = typeof ruta.coordenadas === "string"
      ? JSON.parse(ruta.coordenadas)
      : ruta.coordenadas;
    const coords = coordsArray.map(p => [p.lat, p.lng]);
    const color = colores[i % colores.length];

    const polyline = L.polyline(coords, { color, weight: 4 }).addTo(layerGroup);

    L.marker(coords[0]).addTo(layerGroup).bindPopup("Inicio: " + ruta.nombre);
    L.marker(coords[coords.length - 1]).addTo(layerGroup).bindPopup("Fin: " + ruta.nombre);

    bounds.push(...coords);

    // Click para editar
    polyline.on("click", () => {
      rutaEnEdicion = ruta.id;
      puntosRuta = coords;
      tempGroup.clearLayers();

      coords.forEach((p, idx) => {
        L.marker(p).addTo(tempGroup).bindPopup(`Punto ${idx + 1}`);
      });
      L.polyline(coords, { color: "gray", dashArray: "5,5" }).addTo(tempGroup);

      document.getElementById("tituloForm").textContent = `Editando: ${ruta.nombre}`;
    });
  });

  if (bounds.length > 0) map.fitBounds(bounds);
}

cargarRutas();

document.getElementById("recargarBtn").addEventListener("click", cargarRutas);

map.on("click", (e) => {
  const { lat, lng } = e.latlng;
  puntosRuta.push([lat, lng]);
  tempGroup.clearLayers();

  puntosRuta.forEach((p, idx) => {
    L.marker(p).addTo(tempGroup).bindPopup(`Punto ${idx + 1}`);
  });
  if (puntosRuta.length > 1) {
    L.polyline(puntosRuta, { color: "gray", dashArray: "5,5" }).addTo(tempGroup);
  }
});

document.getElementById("limpiarBtn").addEventListener("click", () => {
  puntosRuta = [];
  rutaEnEdicion = null;
  tempGroup.clearLayers();
  document.getElementById("tituloForm").textContent = "Agregar nueva ruta";
});

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
    res = await fetch(`http://localhost:3000/api/rutas/${rutaEnEdicion}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, coordenadas }),
    });
  } else {
    res = await fetch("http://localhost:3000/api/rutas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, coordenadas }),
    });
  }

  const data = await res.json();
  alert(data.mensaje);

  if (res.ok) {
    puntosRuta = [];
    rutaEnEdicion = null;
    tempGroup.clearLayers();
    document.getElementById("tituloForm").textContent = "Agregar nueva ruta";
    cargarRutas();
  }
});
