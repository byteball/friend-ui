const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server: SocketIOServer } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  const corsOrigin = dev
    ? ['http://localhost:3000']
    : (process.env.NEXT_PUBLIC_SITE_URL || '*');

  const io = new SocketIOServer(server, {
    path: '/api/socket',
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingInterval: 15000,
    pingTimeout: 10000,
    maxHttpBufferSize: 1e6, // 1MB
  });

  // Store Socket.IO instance globally
  globalThis.__SOCKET_IO__ = io;
  console.log('[Socket.IO] Server initialized');
  console.log('[Socket.IO] CORS origin:', corsOrigin);

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Send initial snapshot
    const store = globalThis.__GLOBAL_STORE__;
    if (store) {
      const snapshot = store.getSnapshot();
      socket.emit('SNAPSHOT', snapshot);
    }

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}, reason: ${reason}`);
    });

    socket.on('error', (err) => {
      console.warn(`[Socket.IO] Socket error for ${socket.id}:`, err);
    });
  });

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
