const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server: SocketIOServer } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

console.log(`[Server] Starting in ${dev ? 'development' : 'production'} mode`);
console.log(`[Server] Hostname: ${hostname}, Port: ${port}`);

// CRITICAL: In standalone mode, load the required-server-files.json config
// This tells Next.js where to find its production bundle
if (!dev) {
  try {
    const { config } = require('./.next/required-server-files.json');
    process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(config);
    console.log('[Server] Loaded standalone configuration');
  } catch (err) {
    console.error('[Server] Failed to load standalone config:', err);
  }
}

// In production with standalone, don't pass hostname/port to Next.js
const app = dev ? next({ dev, hostname, port }) : next({ dev });
const handle = app.getRequestHandler();

console.log('[Server] Preparing Next.js app...');

app.prepare().then(() => {
  console.log('[Server] Next.js app prepared successfully');

  const server = createServer(async (req, res) => {
    const requestStart = Date.now();

    try {
      // Log ALL incoming requests (even before parsing)
      console.log(`[HTTP] >>> INCOMING: ${req.method} ${req.url}`);

      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);

      const duration = Date.now() - requestStart;
      console.log(`[HTTP] <<< COMPLETED: ${req.method} ${req.url} (${duration}ms)`);
    } catch (err) {
      const duration = Date.now() - requestStart;
      console.error(`[HTTP] !!! ERROR: ${req.method} ${req.url} (${duration}ms)`, err);
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

    try {
      // Send initial snapshot
      const store = globalThis.__GLOBAL_STORE__;
      if (store) {
        console.log(`[Socket.IO] Sending snapshot to ${socket.id}...`);
        const snapshot = store.getSnapshot();
        socket.emit('SNAPSHOT', snapshot);
        console.log(`[Socket.IO] Snapshot sent to ${socket.id}`);
      } else {
        console.warn(`[Socket.IO] GlobalStore not ready for ${socket.id}`);
      }
    } catch (err) {
      console.error(`[Socket.IO] Error sending snapshot to ${socket.id}:`, err);
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
