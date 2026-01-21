import { appConfig } from '@/app-config';

export const runtime = 'nodejs';

export async function register() {
  const getAllStateVars = (await import('./lib/get-all-state-vars')).default;
  const getObyteClient = (await import('./lib/get-obyte-client')).default;

  console.log("log(bootstrap): Start bootstrapping...");

  // Initialize Socket.IO server inline (same process, avoids bundling issues)
  if (!globalThis.__SOCKET_IO_SERVER_STARTED__) {
    console.log("log(bootstrap): Starting Socket.IO server...");

    try {
      const { createServer } = await import('http');
      const { Server: SocketIOServer } = await import('socket.io');

      const port = parseInt(process.env.SOCKET_PORT || '3001', 10);
      const corsOrigin = process.env.NEXT_PUBLIC_SOCKET_CORS_ORIGIN
        ? process.env.NEXT_PUBLIC_SOCKET_CORS_ORIGIN.split(',')
        : ['http://localhost:3000', 'https://friends.obyte.org'];

      console.log('[Socket.IO] Port:', port);
      console.log('[Socket.IO] CORS origins:', corsOrigin);

      // Create HTTP server for Socket.IO
      const server = createServer((req, res) => {
        if (req.url === '/health') {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('OK');
          return;
        }
        res.writeHead(404);
        res.end('Socket.IO server');
      });

      // Initialize Socket.IO
      const io = new SocketIOServer(server, {
        cors: { origin: corsOrigin, credentials: true },
        transports: ['websocket', 'polling'],
        pingInterval: 15000,
        pingTimeout: 10000,
        maxHttpBufferSize: 1e6,
      });

      globalThis.__SOCKET_IO__ = io;
      console.log('[Socket.IO] Server initialized');

      // Connection handler
      io.on('connection', (socket) => {
        console.log(`[Socket.IO] Client connected: ${socket.id} (total: ${io.engine.clientsCount})`);

        try {
          const store = globalThis.__GLOBAL_STORE__;
          if (store && store.ready) {
            const snapshot = store.getSnapshot();
            socket.emit('SNAPSHOT', snapshot);
            console.log(`[Socket.IO] Snapshot sent to ${socket.id}`);
          } else {
            console.warn(`[Socket.IO] GlobalStore not ready, cannot send snapshot to ${socket.id}`);
          }
        } catch (err) {
          console.error(`[Socket.IO] Error sending snapshot to ${socket.id}:`, err);
          // Don't disconnect client - they can still receive updates
        }

        socket.on('disconnect', (reason) => {
          console.log(`[Socket.IO] Client disconnected: ${socket.id}, reason: ${reason} (remaining: ${io.engine.clientsCount})`);
        });

        socket.on('error', (error) => {
          console.error(`[Socket.IO] Socket error for ${socket.id}:`, error);
        });
      });

      // Global error handler for Socket.IO server
      io.engine.on('connection_error', (err) => {
        console.error('[Socket.IO] Connection error:', err);
      });

      server.listen(port, '0.0.0.0', () => {
        console.log(`[Socket.IO] Ready on http://0.0.0.0:${port}`);
      });

      globalThis.__SOCKET_IO_SERVER_STARTED__ = true;
      console.log("log(bootstrap): Socket.IO server initialized");
    } catch (err) {
      console.error("error(bootstrap): Failed to start Socket.IO server:", err);
    }
  }

  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    console.error("error: Unsupported runtime");
    throw new Error("Unsupported runtime");
  }

  const client = await getObyteClient();

  if (!client) throw new Error("Obyte client is not available");

  // Prevent multiple onConnect() registrations on HMR
  if (!globalThis.__BOOTSTRAP_ONCONNECT_REGISTERED__) {
    globalThis.__BOOTSTRAP_ONCONNECT_REGISTERED__ = true;

    client.onConnect(async () => {
      // load all stateVars
      const initState: IAaState = await getAllStateVars(client, appConfig.AA_ADDRESS);
      let initGovernanceState: Record<string, any> = {};

      console.log('log(bootstrap): all frd state vars are loaded', Object.entries(initState).length);

      const constants = initState.constants ? initState.constants : undefined;

      await client.justsaying("light/new_aa_to_watch", {
        aa: appConfig.AA_ADDRESS
      });

      console.log('log(bootstrap): watching main AA', appConfig.AA_ADDRESS);

      if (constants?.governance_aa) {

        await client.justsaying("light/new_aa_to_watch", {
          aa: constants.governance_aa
        });

        console.log('log(bootstrap): watching governance AA', constants.governance_aa);

        initGovernanceState = await getAllStateVars(client, constants.governance_aa);

        console.log('log(bootstrap): all governance state vars are loaded', Object.entries(initGovernanceState).length);

        console.log('log(bootstrap): watching governance AA', constants.governance_aa);
      }

      const initTokens: Record<string, TokenMeta> = { base: { asset: 'base', symbol: 'GBYTE', decimals: 9 } };
      const assets: string[] = [];

      Object.keys(initState).forEach(key => {
        if (key.startsWith('deposit_asset_')) {
          const asset = key.slice(14);
          assets.push(asset);
        }
      });

      const tokenRegistry = client.api.getOfficialTokenRegistryAddress();

      // tokens from config
      for (const asset of assets) {
        if (asset === "base") continue;

        const [symbol, decimals] = await Promise.all([
          client.api.getSymbolByAsset(tokenRegistry, asset),
          client.api.getDecimalsBySymbolOrAsset(tokenRegistry, asset)
        ]);

        initTokens[asset] = { asset, symbol, decimals };
      }

      console.log('log(bootstrap): all tokens are loaded', Object.entries(initTokens).length);

      if (constants?.asset) {
        const [symbol, decimals] = await Promise.all([
          client.api.getSymbolByAsset(tokenRegistry, constants.asset),
          client.api.getDecimalsBySymbolOrAsset(tokenRegistry, constants.asset)
        ]);

        initTokens[constants.asset] = { asset: constants.asset, symbol, decimals };
      } else {
        console.warn('warn(bootstrap): constants missing, skip FRD token meta');
        throw new Error("Constants missing. Please issue FRD asset first.");
      }

      console.log('log(bootstrap): loading FRD metadata completed, initializing GlobalStore');

      // init store emitter once
      if (!globalThis.__GLOBAL_STORE__) {
        const globalStoreImport = await import('./global-store');

        globalThis.__GLOBAL_STORE__ = new globalStoreImport.GlobalStore({
          initState,
          initTokens,
          initGovernanceState
        });
      } else {
        // re-initialize state and tokens
        globalThis.__GLOBAL_STORE__.initializeState(initState);
        globalThis.__GLOBAL_STORE__.initializeTokens(initTokens);
        globalThis.__GLOBAL_STORE__.initializeGovernanceState(initGovernanceState);
      }

      if (globalThis.__GLOBAL_STORE__.ready) {
        console.log("log(bootstrap): GlobalStore is ready");

        // Ensure Socket.IO connection
        globalThis.__GLOBAL_STORE__.connectSocketIO();
      } else {
        console.error("error(bootstrap): GlobalStore failed to initialize");
      }
    });

  } // End of __BOOTSTRAP_ONCONNECT_REGISTERED__ guard

  // Setup graceful shutdown handlers
  const shutdown = async (signal: string) => {
    console.log(`log(shutdown): Received ${signal}, starting shutdown...`);

    try {
      // Clear heartbeat timer
      if (globalThis.__OBYTE_HEARTBEAT__) {
        clearInterval(globalThis.__OBYTE_HEARTBEAT__);
        console.log('log(shutdown): Cleared Obyte heartbeat');
      }

      // Cleanup GlobalStore listeners before closing Socket.IO
      if (globalThis.__GLOBAL_STORE__) {
        globalThis.__GLOBAL_STORE__.cleanupSocketIOListeners();
        console.log('log(shutdown): GlobalStore listeners cleaned up');
      }

      // Close Socket.IO server
      if (globalThis.__SOCKET_IO__) {
        await new Promise<void>((resolve) => {
          globalThis.__SOCKET_IO__?.close(() => {
            console.log('log(shutdown): Socket.IO server closed');
            resolve();
          });
        });
      }

      // Close Obyte WebSocket connection
      if (globalThis.__OBYTE_CLIENT__) {
        // @ts-expect-error accessing internal ws
        globalThis.__OBYTE_CLIENT__.client.ws.close();
        console.log('log(shutdown): Obyte client disconnected');
      }

      console.log('log(shutdown): Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('error(shutdown): Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Register shutdown handlers
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
