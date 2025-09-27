// Inicializar mapa centrado en Arequipa
const map = L.map('map').setView([-16.3989, -71.5350], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'OpenStreetMap Arequipa',
  maxZoom: 18
}).addTo(map);

// Capa donde se dibujarán rutas y marcadores
const layerGroup = L.layerGroup().addTo(map);

// 🔹 Función para geocodificar direcciones en Arequipa
async function geocodificar(direccion) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion + ', Arequipa, Perú')}`);
  const data = await res.json();
  if (data.length === 0) throw new Error("No se encontró dirección: " + direccion);
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

// 🔹 Consultar ruta al backend y dibujarla en el mapa
async function consultarRuta() {
  const origen = document.getElementById('origen').value;
  const destino = document.getElementById('destino').value;

  const res = await fetch('http://localhost:3000/api/ruta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origen, destino })
  });

  const data = await res.json();
  if (!res.ok) return alert(data.mensaje);

  // Mostrar texto de la ruta
  document.getElementById('resultado').innerHTML =
    data.ruta.map(r => `<p><b>${r.linea}</b>: ${r.desde} ➝ ${r.hasta}</p>`).join('');

  // Limpiar mapa
  layerGroup.clearLayers();

  const colores = ['blue', 'green', 'red', 'orange'];
  let colorIndex = 0;

  // Dibujar cada tramo de la ruta
  for (const tramo of data.ruta) {
    try {
      const coordDesde = await geocodificar(tramo.desde);
      const coordHasta = await geocodificar(tramo.hasta);

      // Llamada a OpenRouteService para obtener geometría
      const orsRes = await fetch(`https://api.openrouteservice.org/v2/directions/foot-walking/geojson`, {
        method: 'POST',
        headers: {
          'Authorization': 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImExNmE5YTc4NTBhZDQ1Mjc4N2NmMzk1MGYyMWFhMzNiIiwiaCI6Im11cm11cjY0In0=',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coordinates: [
            [coordDesde[1], coordDesde[0]], // [lon, lat]
            [coordHasta[1], coordHasta[0]]
          ]
        })
      });

      const orsData = await orsRes.json();
      if (orsData && orsData.features) {
        L.geoJSON(orsData, {
          style: { color: colores[colorIndex % colores.length], weight: 4 }
        }).addTo(layerGroup);
      }

      // Agregar marcadores de inicio y fin
      L.marker(coordDesde).addTo(layerGroup).bindPopup("Inicio: " + tramo.desde);
      L.marker(coordHasta).addTo(layerGroup).bindPopup("Fin: " + tramo.hasta);

      colorIndex++;
    } catch (err) {
      console.error("Error en tramo:", tramo, err);
    }
  }
}
