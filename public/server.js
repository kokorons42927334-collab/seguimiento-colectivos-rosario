const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Servir la carpeta public para la vista web
app.use(express.static(path.join(__dirname, 'public')));

const colectivosEnVivo = {};

io.on('connection', (socket) => {
  console.log('📱 Dispositivo conectado:', socket.id);

  socket.emit('ubicaciones-iniciales', Object.values(colectivosEnVivo));

  // Recibir ubicación enviada desde el celular/chofer
  socket.on('actualizar-posicion', (data) => {
    colectivosEnVivo[data.idColectivo] = {
      ...data,
      ultimaActualizacion: new Date().toISOString()
    };
    io.emit('posicion-actualizada', colectivosEnVivo[data.idColectivo]);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Dispositivo desconectado:', socket.id);
  });
});

// Simulación de prueba en Rosario para ver el mapa en funcionamiento
let latPrueba = -32.9468;
let lngPrueba = -60.6393;

setInterval(() => {
  latPrueba += (Math.random() - 0.49) * 0.001;
  lngPrueba += (Math.random() - 0.49) * 0.001;

  const datosSimulados = {
    idColectivo: 'COL-115-01',
    linea: 'K / 115',
    lat: latPrueba,
    lng: lngPrueba
  };

  colectivosEnVivo[datosSimulados.idColectivo] = datosSimulados;
  io.emit('posicion-actualizada', datosSimulados);
}, 3000);

server.listen(PORT, () => {
  console.log(`🚀 Servidor listo en puerto ${PORT}`);
});
