import "server-only";

import { LRUCache } from "lru-cache";
import { EventEmitter } from "stream";
import type { Server as SocketIOServer } from 'socket.io';

import { appConfig } from "./app-config";
import { STORE_EVENTS } from "./constants";
import { getCeilingPrice, getTotalBalance } from "./lib/calculations/get-rewards";

interface IInitialSymbols {
  [key: string]: TokenMeta;
}

interface GlobalStoreOptions {
  initState: IAaState;
  initTokens: IInitialSymbols;
  initGovernanceState: Record<string, any>;
}

interface IAttestation {
  username?: string;
  userId?: string;
}

const ATTESTATION_TTL = 1000 * 60 * 60; // 1 hour

export class GlobalStore extends EventEmitter {
  client: typeof globalThis.__OBYTE_CLIENT__;
  state: LRUCache<string, any>;
  governanceState: LRUCache<string, any>;
  tokens: LRUCache<string, TokenMeta>;
  leaderboardData: LRUCache<string, UserRank>;

  tgAttestations: LRUCache<string, IAttestation>;
  discordAttestations: LRUCache<string, IAttestation>;

  socketIO?: SocketIOServer;
  socketIOConnected: boolean = false;
  socketIOListenersSetup: boolean = false;

  ready: boolean = false;
  stateUpdateId: number;
  gbytePriceUSD: number = 0;

  // Debounce timer for leaderboard revalidation
  private leaderboardRevalidationTimer?: NodeJS.Timeout;

  // Deduplication hashes for server-side filtering
  private lastStateUpdateHash?: string;
  private lastGovernanceUpdateHash?: string;

  // Store listener references for cleanup
  private snapshotListener?: (payload: IClientSnapshot) => void;
  private stateUpdateListener?: (payload: IAaState) => void;
  private governanceUpdateListener?: (payload: Record<string, any>) => void;

  constructor({ initState, initTokens, initGovernanceState }: GlobalStoreOptions = { initState: {}, initTokens: {}, initGovernanceState: {} }) {
    super();

    // Set reasonable max listeners limit with monitoring
    this.setMaxListeners(50);

    // Monitor listener count every minute to detect leaks early
    setInterval(() => {
      const snapshotListeners = this.listenerCount(STORE_EVENTS.SNAPSHOT);
      const stateUpdateListeners = this.listenerCount(STORE_EVENTS.STATE_UPDATE);
      const govListeners = this.listenerCount(STORE_EVENTS.GOVERNANCE_STATE_UPDATE);

      if (snapshotListeners > 10 || stateUpdateListeners > 10 || govListeners > 10) {
        console.warn(
          `warn(GlobalStore): High listener count detected - possible memory leak!`,
          { snapshotListeners, stateUpdateListeners, govListeners }
        );
      }
    }, 60000); // Check every minute

    this.state = new LRUCache<string, any>({
      max: 10000,
      ttl: 0,
    });

    this.governanceState = new LRUCache<string, any>({
      max: 10000,
      ttl: 0,
    });

    this.tokens = new LRUCache<string, TokenMeta>({
      max: 500,
      ttl: 0,
    });

    this.leaderboardData = new LRUCache<string, UserRank>({
      max: 150,
      ttl: 0,
    });

    this.tgAttestations = new LRUCache<string, IAttestation>({
      max: 500,
      ttl: ATTESTATION_TTL
    });

    this.discordAttestations = new LRUCache<string, IAttestation>({
      max: 500,
      ttl: ATTESTATION_TTL
    });

    this.initializeState(initState);
    this.initializeGovernanceState(initGovernanceState);
    this.initializeTokens(initTokens);

    this.client = globalThis.__OBYTE_CLIENT__;

    this.ready = true;
    this.stateUpdateId = 0;

    this.gbytePriceUSD = 0;

    // Note: Socket.IO connection will be initiated from instrumentation.node.ts
    // after server.js initializes the Socket.IO server
  }

  initializeState(initState: IAaState) {
    if (!this.state) throw new Error("State storage is not initialized");

    for (const [k, v] of Object.entries(initState)) {
      this.state.set(k, v);
    }

    this.stateUpdateId += 1;
    this.revalidateLeaderboardData();
  }

  initializeGovernanceState(initState: object) {
    if (!this.governanceState) throw new Error("Governance state storage is not initialized");

    for (const [k, v] of Object.entries(initState)) {
      this.governanceState.set(k, v);
    }
  }

  initializeTokens(initTokens: IInitialSymbols) {
    if (!this.tokens) throw new Error("Tokens storage is not initialized");

    for (const [k, v] of Object.entries(initTokens)) {
      this.tokens.set(k, v);
    }
  }

  send(event: STORE_EVENTS, payload: any) {
    this.emit(event, payload);
  }


  getSnapshot(): IClientSnapshot {
    return {
      state: this.getState(),
      governanceState: this.getGovernanceState(),
      tokens: this.getTokens(),
      gbytePriceUSD: this.gbytePriceUSD,
      params: this.state.get("variables") as AgentParams ?? appConfig.initialParamsVariables,
    }
  }

  getGbytePriceUSD(): number {
    return this.gbytePriceUSD;
  }

  getFrdPriceUSD(): number {
    const constants = this.state.get('constants') as IConstants | undefined;
    if (!constants) return 0;

    const frdToken = this.tokens.get(constants.asset);
    if (!frdToken) return 0;

    const ceilPrice = getCeilingPrice(constants);

    return ceilPrice * this.gbytePriceUSD;
  }

  sendSnapshot() {
    this.send(STORE_EVENTS.SNAPSHOT, this.getSnapshot());
  }

  getState(): IAaState {
    return Object.fromEntries(this.state.entries());
  }

  getGovernanceState(): IAaState {
    return Object.fromEntries(this.governanceState.entries());
  }

  getTokens(): Record<string, TokenMeta> {
    return Object.fromEntries(this.tokens.entries());
  }

  getOwnToken() {
    const constants = this.state.get('constants') as IConstants | undefined;

    if (!constants) return {
      asset: "unknown",
      symbol: 'FRD',
      decimals: 9
    } as TokenMeta;

    return this.tokens.get(constants.asset);
  }

  getLeaderboardData(): UserRank[] {
    return Array.from(this.leaderboardData.values());
  }

  updateState(newStateVars: IAaState) {
    for (const [k, v] of Object.entries(newStateVars)) {
      this.state.set(k, v);
    }

    this.sendStateUpdate(newStateVars);
    this.scheduleLeaderboardRevalidation();
    this.stateUpdateId += 1;
  }

  // Debounced leaderboard revalidation to prevent excessive recalculations
  private scheduleLeaderboardRevalidation() {
    // Clear existing timer if any
    if (this.leaderboardRevalidationTimer) {
      clearTimeout(this.leaderboardRevalidationTimer);
    }

    // Schedule new revalidation after 2 seconds of inactivity
    // Longer delay prevents CPU spikes during rapid updates
    this.leaderboardRevalidationTimer = setTimeout(() => {
      this.revalidateLeaderboardData();
    }, 2000);
  }

  updateGovernanceState(newStateVars: Record<string, any>) {
    for (const [k, v] of Object.entries(newStateVars)) {
      this.governanceState.set(k, v);
    }

    this.sendGovernanceStateUpdate(newStateVars);
  }

  sendStateUpdate(update: IAaState) {
    // Server-side deduplication to reduce network traffic
    // Use lightweight hash instead of JSON.stringify to avoid blocking event loop
    const keys = Object.keys(update);
    const hash = `${keys.length}:${keys[0] || ''}`;
    if (hash === this.lastStateUpdateHash) {
      console.log('log(GlobalStore): STATE_UPDATE deduplicated on server');
      return;
    }
    this.lastStateUpdateHash = hash;
    this.send(STORE_EVENTS.STATE_UPDATE, update);
  }

  sendGovernanceStateUpdate(update: Record<string, any>) {
    // Server-side deduplication for governance updates
    // Use lightweight hash instead of JSON.stringify to avoid blocking event loop
    const keys = Object.keys(update);
    const hash = `gov:${keys.length}:${keys[0] || ''}`;
    if (hash === this.lastGovernanceUpdateHash) {
      console.log('log(GlobalStore): GOVERNANCE_STATE_UPDATE deduplicated on server');
      return;
    }
    this.lastGovernanceUpdateHash = hash;
    this.send(STORE_EVENTS.GOVERNANCE_STATE_UPDATE, update);
  }

  async revalidateLeaderboardData() {
    const startTime = Date.now();
    const friends: { [key: string]: string[] } = {};
    const balancePromises: Promise<[string, number]>[] = [];

    const constants = this.state.get('constants');
    if (!constants) return;
    const ceilPrice = getCeilingPrice(constants as IConstants);

    // Collect friends and prepare balance calculations in parallel
    for (const [key, value] of this.state.entries()) {
      if (key.startsWith('friend_')) {
        const [, addr] = key.split('_');
        if (!friends[addr]) friends[addr] = [];
        friends[addr].push(value);
      } else if (key.startsWith('user_') && !value.ghost) {
        const [, addr] = key.split('_');
        // Schedule async computation - don't await here!
        balancePromises.push(
          getTotalBalance(value.balances ?? {}, ceilPrice)
            .then(result => [addr, result.sans_reducers] as [string, number])
        );
      }
    }

    // Execute balance calculations in batches to avoid CPU overload
    console.log(`log(leaderboard): Processing ${balancePromises.length} users in batches`);
    const BATCH_SIZE = 50; // Process 50 at a time to avoid CPU spike
    const totalBalances = new Map<string, number>();

    for (let i = 0; i < balancePromises.length; i += BATCH_SIZE) {
      const batch = balancePromises.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch);
      for (const [addr, balance] of batchResults) {
        totalBalances.set(addr, balance);
      }
      // Small delay between batches to let CPU breathe
      if (i + BATCH_SIZE < balancePromises.length) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }

    const newEntries: Array<[string, UserRank]> = [];
    for (const [addr, totalBalance] of totalBalances.entries()) {
      const userFriends = friends[addr] || [];
      const newUsersCount = this.state.get(`user_${addr}`)?.new_users ?? 0;

      newEntries.push([
        addr,
        {
          address: addr,
          amount: totalBalance,
          friends: userFriends.length,
          new_users: newUsersCount
        },
      ]);
    }

    this.leaderboardData.clear();
    for (const [addr, data] of newEntries) {
      this.leaderboardData.set(addr, data);
    }

    const duration = Date.now() - startTime;
    if (duration > 2000) {
      console.warn(`warn(leaderboard): Slow revalidation took ${duration}ms for ${balancePromises.length} users`);
    } else {
      console.log(`log(leaderboard): Revalidated ${balancePromises.length} users in ${duration}ms`);
    }
  }

  // Attestations management

  async getTgAttestation(address: string): Promise<IAttestation | null> {
    if (this.tgAttestations.has(address)) {
      return this.tgAttestations.get(address) || null;
    }

    if (!this.client) {
      console.error("error(getTgAttestation): obyte client missing");
      return null;
    }

    const attestations = await this.client.api.getAttestations({ address }).catch(() => ([]));

    const tgAttestation = attestations.find(att => att.attestor_address === appConfig.NEXT_PUBLIC_TELEGRAM_ATTESTOR)?.profile as IAttestation | undefined;

    if (tgAttestation) {
      this.tgAttestations.set(address, tgAttestation);
    }

    return tgAttestation || null;
  }

  async getDiscordAttestation(address: string): Promise<IAttestation | null> {
    if (this.discordAttestations.has(address)) {
      return this.discordAttestations.get(address) || null;
    }

    if (!this.client) {
      console.error("error(discordAttestations): obyte client missing");
      return null;
    }

    const attestations = await this.client.api.getAttestations({ address }).catch(() => null) || [];

    const discordAttestation = attestations.find(att => att.attestor_address === appConfig.NEXT_PUBLIC_DISCORD_ATTESTOR)?.profile as IAttestation | undefined;

    if (discordAttestation) {
      this.discordAttestations.set(address, discordAttestation);
    }

    return discordAttestation || null;
  }


  // tokens

  async addTokenToList(asset: string) {
    if (!asset || !this.client) return;

    const tokenRegistry = this.client.api.getOfficialTokenRegistryAddress();

    const [symbol, decimals] = await Promise.all([
      this.client.api.getSymbolByAsset(tokenRegistry, asset),
      this.client.api.getDecimalsBySymbolOrAsset(tokenRegistry, asset)
    ]);

    this.tokens.set(asset, { asset, symbol, decimals });
  }

  // Socket.IO integration

  connectSocketIO(retryCount = 0, maxRetries = 10) {
    // Prevent multiple connections
    if (this.socketIOConnected) {
      console.log('log(GlobalStore): Already connected to Socket.IO server, skipping');
      return;
    }

    if (typeof globalThis.__SOCKET_IO__ !== 'undefined') {
      this.socketIO = globalThis.__SOCKET_IO__;
      this.setupSocketIOListeners();
      this.socketIOConnected = true;
      console.log('log(GlobalStore): Connected to Socket.IO server');
    } else {
      if (retryCount >= maxRetries) {
        console.error(`error(GlobalStore): Failed to connect to Socket.IO after ${maxRetries} attempts`);
        return;
      }
      // Retry connection after bootstrap completes
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
      setTimeout(() => this.connectSocketIO(retryCount + 1, maxRetries), delay);
    }
  }

  setupSocketIOListeners() {
    if (!this.socketIO) return;

    // Prevent duplicate listener registration
    if (this.socketIOListenersSetup) {
      console.log('log(GlobalStore): Socket.IO listeners already set up, skipping');
      return;
    }

    this.socketIOListenersSetup = true;

    // Create listener functions and store references for cleanup
    this.snapshotListener = (payload: IClientSnapshot) => {
      try {
        if (this.socketIO && this.socketIO.sockets) {
          this.socketIO.emit(STORE_EVENTS.SNAPSHOT, payload);
        }
      } catch (err) {
        console.error('error(GlobalStore): Failed to emit SNAPSHOT', err);
      }
    };

    this.stateUpdateListener = (payload: IAaState) => {
      try {
        if (this.socketIO && this.socketIO.sockets) {
          this.socketIO.emit(STORE_EVENTS.STATE_UPDATE, payload);
        }
      } catch (err) {
        console.error('error(GlobalStore): Failed to emit STATE_UPDATE', err);
      }
    };

    this.governanceUpdateListener = (payload: Record<string, any>) => {
      try {
        if (this.socketIO && this.socketIO.sockets) {
          this.socketIO.emit(STORE_EVENTS.GOVERNANCE_STATE_UPDATE, payload);
        }
      } catch (err) {
        console.error('error(GlobalStore): Failed to emit GOVERNANCE_STATE_UPDATE', err);
      }
    };

    // Register listeners
    this.on(STORE_EVENTS.SNAPSHOT, this.snapshotListener);
    this.on(STORE_EVENTS.STATE_UPDATE, this.stateUpdateListener);
    this.on(STORE_EVENTS.GOVERNANCE_STATE_UPDATE, this.governanceUpdateListener);

    console.log('log(GlobalStore): Socket.IO listeners set up');
  }

  cleanupSocketIOListeners() {
    if (!this.socketIOListenersSetup) return;

    console.log('log(GlobalStore): Cleaning up Socket.IO listeners');

    // Remove all listeners
    if (this.snapshotListener) {
      this.off(STORE_EVENTS.SNAPSHOT, this.snapshotListener);
      this.snapshotListener = undefined;
    }

    if (this.stateUpdateListener) {
      this.off(STORE_EVENTS.STATE_UPDATE, this.stateUpdateListener);
      this.stateUpdateListener = undefined;
    }

    if (this.governanceUpdateListener) {
      this.off(STORE_EVENTS.GOVERNANCE_STATE_UPDATE, this.governanceUpdateListener);
      this.governanceUpdateListener = undefined;
    }

    this.socketIOListenersSetup = false;
    console.log('log(GlobalStore): Socket.IO listeners cleaned up');
  }
}
