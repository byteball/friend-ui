import "server-only";

import { LRUCache } from "lru-cache";
import { EventEmitter } from "stream";

import { appConfig } from "./appConfig";
import { STORE_EVENTS } from "./constants";
import { getCeilingPrice, getTotalBalance } from "./lib/calculations/getRewards";

interface IInitialSymbols {
  [key: string]: TokenMeta;
}

interface GlobalStoreOptions {
  initState: IAaState;
  initTokens: IInitialSymbols;
  initGovernanceState: Record<string, any>;
}

const ATTESTATION_TTL = 1000 * 60 * 60; // 1 hour

export class GlobalStore extends EventEmitter {
  state: LRUCache<string, any>;
  governanceState: LRUCache<string, any>;
  tokens: LRUCache<string, TokenMeta>;
  leaderboardData: LRUCache<string, UserRank>;

  tgAttestations: LRUCache<string, string>;
  discordAttestations: LRUCache<string, string>;

  ready: boolean = false;
  stateUpdateId: number;

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

    this.tgAttestations = new LRUCache<string, string>({
      max: 500,
      ttl: ATTESTATION_TTL
    });

    this.discordAttestations = new LRUCache<string, string>({
      max: 500,
      ttl: ATTESTATION_TTL
    });

    this.initializeState(initState);
    this.initializeGovernanceState(initGovernanceState);
    this.initializeTokens(initTokens);

    this.ready = true;
    this.stateUpdateId = 0;
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
      params: this.state.get("variables") as AgentParams ?? appConfig.initialParamsVariables,
    }
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
        const totalBalance = await getTotalBalance(value.balances ?? {}, ceilPrice);
        totalBalances.set(addr, totalBalance);
      }
    }

    const newEntries: Array<[string, UserRank]> = [];
    for (const [addr, totalBalance] of totalBalances.entries()) {
      const userFriends = friends[addr] || [];
      newEntries.push([
        addr,
        {
          username: addr,
          amount: totalBalance,
          friends: userFriends.length,
        },
      ]);
    }

    this.leaderboardData.clear();
    for (const [addr, data] of newEntries) {
      this.leaderboardData.set(addr, data);
    }
  }
}
