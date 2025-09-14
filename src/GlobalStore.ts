import "server-only";

import { LRUCache } from "lru-cache";
import { EventEmitter } from "stream";

import { STORE_EVENTS } from "./constants";

interface IInitialSymbols {
  [key: string]: TokenMeta;
}

interface GlobalStoreOptions {
  initState: IAaStore;
  initTokens: IInitialSymbols;
}

export class GlobalStore extends EventEmitter {
  state: LRUCache<string, any>;
  tokens: LRUCache<string, TokenMeta>;

  ready: boolean = false;

  constructor({ initState, initTokens }: GlobalStoreOptions = { initState: {}, initTokens: {} }) {
    super();

    this.setMaxListeners(1000); // avoid memory leak warnings — we control listeners

    this.state = new LRUCache<string, any>({
      max: 10000,
      ttl: 0,
    });

    this.tokens = new LRUCache<string, TokenMeta>({
      max: 500,
      ttl: 0,
    });

    this.initializeState(initState);
    this.initializeTokens(initTokens);

    this.ready = true;
  }

  initializeState(initState: IAaStore) {
    if (!this.state) throw new Error("State storage is not initialized");

    for (const [k, v] of Object.entries(initState)) {
      this.state.set(k, v);
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
      tokens: this.getTokens(),
    }
  }

  sendSnapshot() {
    this.send(STORE_EVENTS.SNAPSHOT, this.getSnapshot());
  }

  getState(): IAaStore {
    return Object.fromEntries(this.state.entries());
  }

  getTokens(): Record<string, TokenMeta> {
    return Object.fromEntries(this.tokens.entries());
  }

  updateState(newStateVars: IAaStore) {
    for (const [k, v] of Object.entries(newStateVars)) {
      this.state.set(k, v);
    }

    this.sendStateUpdate(newStateVars);
  }

  sendStateUpdate(update: IAaStore) {
    this.send(STORE_EVENTS.STORE_UPDATE, update);
  }
}