const map = L.map("map").setView([-16.409047, -71.537451], 13);

// Cargar tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

// Cargar rutas desde el backend
async function cargarRutas() {
  const response = await fetch("http://localhost:3000/api/rutas");
  const rutas = await response.json();

  rutas.forEach(ruta => {
    const coords = ruta.coordenadas.map(p => [p.lat, p.lng]);
    L.polyline(coords, { color: "blue", weight: 4 }).addTo(map);
    L.marker(coords[0]).addTo(map).bindPopup("Inicio: " + ruta.nombre);
    L.marker(coords[coords.length - 1]).addTo(map).bindPopup("Fin: " + ruta.nombre);
  });
}

document.getElementById("formRuta").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreRuta").value;
  const coordsTexto = document.getElementById("coordsRuta").value;

  // Transformar texto en array de coordenadas
  const coordenadas = coordsTexto.split(";").map(c => {
    const [lat, lng] = c.trim().split(",");
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  });

  const res = await fetch("http://localhost:3000/api/rutas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, coordenadas })
  });

  const data = await res.json();
  alert(data.mensaje);

  if (res.ok) {
    // Dibujar nueva ruta en el mapa
    const coords = coordenadas.map(p => [p.lat, p.lng]);
    L.polyline(coords, { color: "green", weight: 4 }).addTo(map);
    L.marker(coords[0]).addTo(map).bindPopup("Inicio: " + nombre);
    L.marker(coords[coords.length - 1]).addTo(map).bindPopup("Fin: " + nombre);
  }
});

cargarRutas();
