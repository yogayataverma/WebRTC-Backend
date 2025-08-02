const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mediasoup = require('mediasoup');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: '*' } });

let worker;
let router;
let transports = [];
let producers = [];
let consumers = [];
let users = new Map();

const createWorkerAndRouter = async () => {
  worker = await mediasoup.createWorker();
  router = await worker.createRouter({
    mediaCodecs: [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
      },
    ],
  });
};

createWorkerAndRouter();

io.on('connection', (socket) => {
  users.set(socket.id, {
    id: socket.id,
    name: `User-${socket.id.substring(0, 6)}`,
    producers: [],
    consumers: [],
    transports: []
  });

  socket.on('setUserName', (userName, cb) => {
    const user = users.get(socket.id);
    if (user) {
      user.name = userName || `User-${socket.id.substring(0, 6)}`;
      
      const userProducers = producers.filter(p => user.producers.includes(p.id));
      if (userProducers.length > 0) {
        socket.broadcast.emit('userNameUpdated', {
          userId: socket.id,
          userName: user.name,
          producers: userProducers.map(p => ({ id: p.id, kind: p.kind }))
        });
      }
      
      cb({ success: true });
    } else {
      cb({ error: 'User not found' });
    }
  });


  const existingProducers = producers.map(producer => {

    const ownerEntry = Array.from(users.entries()).find(([userId, userData]) => 
      userData.producers.includes(producer.id)
    );
    return {
      id: producer.id,
      kind: producer.kind,
      userId: ownerEntry ? ownerEntry[0] : 'unknown',
      userName: ownerEntry ? ownerEntry[1].name : 'Unknown User'
    };
  });
  
  socket.emit('activeProducers', existingProducers);

  socket.on('getRtpCapabilities', (cb) => cb(router.rtpCapabilities));

  socket.on('createTransport', async (cb) => {
    try {
      const transport = await router.createWebRtcTransport({
        listenIps: [
          { ip: '127.0.0.1', announcedIp: null },
          { ip: '0.0.0.0', announcedIp: null }    
        ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
      });
      
      transports.push(transport);
      users.get(socket.id).transports.push(transport.id);
      
      cb({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });
    } catch (error) {
      cb({ error: error.message });
    }
  });

  socket.on('connectTransport', async ({ transportId, dtlsParameters }, cb) => {
    try {
      const transport = transports.find(t => t.id === transportId);
      if (!transport) {
        return cb({ error: 'Transport not found' });
      }
      await transport.connect({ dtlsParameters });
      cb({ success: true });
    } catch (error) {
      cb({ error: error.message });
    }
  });

  socket.on('produce', async ({ transportId, kind, rtpParameters }, cb) => {
    try {
      const transport = transports.find(t => t.id === transportId);
      if (!transport) {
        return cb({ error: 'Transport not found' });
      }
      
      const producer = await transport.produce({ kind, rtpParameters });
      producers.push(producer);
      users.get(socket.id).producers.push(producer.id);
      
      const user = users.get(socket.id);
      
      socket.broadcast.emit('newProducer', { 
        producerId: producer.id, 
        kind: producer.kind,
        userId: socket.id,
        userName: user.name
      });
      
      cb({ id: producer.id });
    } catch (error) {
      cb({ error: error.message });
    }
  });

  socket.on('consume', async ({ transportId, producerId, rtpCapabilities }, cb) => {
    try {
      const transport = transports.find(t => t.id === transportId);
      const producer = producers.find(p => p.id === producerId);
      
      if (!transport) {
        return cb({ error: 'Transport not found' });
      }
      if (!producer) {
        return cb({ error: 'Producer not found' });
      }
      
      const user = users.get(socket.id);
      if (user && user.producers.includes(producerId)) {
        return cb({ error: 'Cannot consume own producer' });
      }
      
      if (!router.canConsume({ producerId, rtpCapabilities })) {
        return cb({ error: 'Cannot consume' });
      }
      
      const consumer = await transport.consume({
        producerId,
        rtpCapabilities,
        paused: false,
      });
      
      consumers.push(consumer);
      users.get(socket.id).consumers.push(consumer.id);
      
      cb({
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        producerId: producer.id,
      });
    } catch (error) {
      cb({ error: error.message });
    }
  });

  socket.on('getAvailableProducers', (cb) => {
    const user = users.get(socket.id);
    
    const availableProducers = producers
      .filter(producer => {
        return user && !user.producers.includes(producer.id);
      })
      .map(producer => {
        const ownerEntry = Array.from(users.entries()).find(([userId, userData]) => 
          userData.producers.includes(producer.id)
        );
        return {
          id: producer.id,
          kind: producer.kind,
          userId: ownerEntry ? ownerEntry[0] : 'unknown',
          userName: ownerEntry ? ownerEntry[1].name : 'Unknown User'
        };
      });
    
    cb(availableProducers);
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      user.producers.forEach(producerId => {
        const producerIndex = producers.findIndex(p => p.id === producerId);
        if (producerIndex !== -1) {
          producers[producerIndex].close();
          producers.splice(producerIndex, 1);
          io.emit('producerClosed', { producerId });
        }
      });
      
      user.consumers.forEach(consumerId => {
        const consumerIndex = consumers.findIndex(c => c.id === consumerId);
        if (consumerIndex !== -1) {
          consumers[consumerIndex].close();
          consumers.splice(consumerIndex, 1);
        }
      });
      
      user.transports.forEach(transportId => {
        const transportIndex = transports.findIndex(t => t.id === transportId);
        if (transportIndex !== -1) {
          transports[transportIndex].close();
          transports.splice(transportIndex, 1);
        }
      });
    }
    
    users.delete(socket.id);
  });
});

server.listen(4000, () => {});
