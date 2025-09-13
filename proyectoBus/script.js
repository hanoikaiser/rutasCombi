const map = L.map('map').setView([-16.3989, -71.535], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const layerGroup = L.layerGroup().addTo(map);

async function geocodificar(direccion) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion + ', Arequipa, Perú')}`);
  const datos = await response.json();
  if (datos.length === 0) throw new Error('Dirección no encontrada');
  return [parseFloat(datos[0].lat), parseFloat(datos[0].lon)];
}

async function consultarRuta() {
  const origen = document.getElementById('origen').value;
  const destino = document.getElementById('destino').value;

  if (!origen || !destino) {
    alert("Por favor, completa ambos campos.");
    return;
  }

  try {
    const respuesta = await fetch('http://localhost:3000/api/ruta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origen, destino })
    });

    const datos = await respuesta.json();

    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = `
      <h3>Ruta sugerida:</h3>
      <ul>
        ${datos.ruta.map(p => `<li>Línea ${p.linea}: de <strong>${p.desde}</strong> a <strong>${p.hasta}</strong></li>`).join('')}
      </ul>
      <p><strong>Tiempo estimado:</strong> ${datos.tiempo_estimado_min} minutos</p>
    `;

    layerGroup.clearLayers();

    const coordenadas = [];
    for (const punto of datos.ruta) {
      const latlonDesde = await geocodificar(punto.desde);
      coordenadas.push(latlonDesde);
    }
    const destinoCoord = await geocodificar(datos.ruta.at(-1).hasta);
    coordenadas.push(destinoCoord);

    const polyline = L.polyline(coordenadas, { color: 'blue' }).addTo(layerGroup);
    map.fitBounds(polyline.getBounds());

    coordenadas.forEach((coor, i) => {
      L.marker(coor).addTo(layerGroup)
        .bindPopup(i === 0 ? 'Origen' : (i === coordenadas.length - 1 ? 'Destino' : 'Transbordo'));
    });

  } catch (error) {
    console.error('Error:', error);
    alert("No se pudo obtener la ruta. Verifica direcciones o el servidor.");
  }
}
