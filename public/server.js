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

  // Enviar las posiciones guardadas al usuario que se acaba de conectar
  socket.emit('ubicaciones-iniciales', Object.values(colectivosEnVivo));

  // Recibir la posición en tiempo real desde chofer.html
  socket.on('actualizar-posicion', (data) => {
    colectivosEnVivo[data.idColectivo] = {
      ...data,
      ultimaActualizacion: new Date().toISOString()
    };

    // Retransmitir la posición a todos los mapas abiertos en tiempo real
    io.emit('posicion-actualizada', colectivosEnVivo[data.idColectivo]);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Dispositivo desconectado:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor listo en puerto ${PORT}`);
});
