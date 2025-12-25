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

  ready: boolean = false;
  stateUpdateId: number;
  gbytePriceUSD: number = 0;

  constructor({ initState, initTokens, initGovernanceState }: GlobalStoreOptions = { initState: {}, initTokens: {}, initGovernanceState: {} }) {
    super();

    this.setMaxListeners(1000); // avoid memory leak warnings — we control listeners

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
    this.revalidateLeaderboardData();
    this.stateUpdateId += 1;
  }

  updateGovernanceState(newStateVars: Record<string, any>) {
    for (const [k, v] of Object.entries(newStateVars)) {
      this.governanceState.set(k, v);
    }

    this.sendGovernanceStateUpdate(newStateVars);
  }

  sendStateUpdate(update: IAaState) {
    this.send(STORE_EVENTS.STATE_UPDATE, update);
  }

  sendGovernanceStateUpdate(update: Record<string, any>) {
    this.send(STORE_EVENTS.GOVERNANCE_STATE_UPDATE, update);
  }

  async revalidateLeaderboardData() {
    const friends: { [key: string]: string[] } = {};
    const totalBalances: Map<string, number> = new Map();

    const constants = this.state.get('constants');
    if (!constants) return;
    const ceilPrice = getCeilingPrice(constants as IConstants);

    for (const [key, value] of this.state.entries()) {
      if (key.startsWith('friend_')) {
        const [, addr] = key.split('_');
        if (!friends[addr]) friends[addr] = [];
        friends[addr].push(value);
      } else if (key.startsWith('user_') && !value.ghost) {
        const [, addr] = key.split('_');
        const totalBalance = (await getTotalBalance(value.balances ?? {}, ceilPrice)).sans_reducers;
        totalBalances.set(addr, totalBalance);
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

    // Listen to GlobalStore events and broadcast via Socket.IO
    this.on(STORE_EVENTS.SNAPSHOT, (payload: IClientSnapshot) => {
      this.socketIO?.emit(STORE_EVENTS.SNAPSHOT, payload);
    });

    this.on(STORE_EVENTS.STATE_UPDATE, (payload: IAaState) => {
      this.socketIO?.emit(STORE_EVENTS.STATE_UPDATE, payload);
    });

    this.on(STORE_EVENTS.GOVERNANCE_STATE_UPDATE, (payload: Record<string, any>) => {
      this.socketIO?.emit(STORE_EVENTS.GOVERNANCE_STATE_UPDATE, payload);
    });
  }
}
