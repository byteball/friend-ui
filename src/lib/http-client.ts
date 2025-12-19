import { appConfig } from '@/app-config';
import { cache } from 'react';

class Client {
  hubAddress: string;
  witnesses: string[] | null;

  constructor() {
    this.hubAddress = appConfig.TESTNET ? "https://testnet.obyte.org/api" : "https://obyte.org/api";
    this.witnesses = null;
  }

  async request(path: string, body = {}) {
    const response = await fetch(`${this.hubAddress}/${path}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: "post",
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorObject = {};

      try {
        errorObject = errorBody && JSON.parse(errorBody);
      } catch { }

      if (errorObject && ("error" in errorObject)) {
        // @ts-expect-error has error property
        throw new Error(errorObject.error);
      } else {
        // throw new Error("unknown error");
      }
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    } else {
      return data?.data;
    }
  }

  async getLastMci() {
    return await this.request("get_last_mci");
  }

  async getPeers() {
    return await this.request("get_peers");
  }

  async getWitnesses(update = false) {
    if (this.witnesses && !update) {
      return this.witnesses;
    } else {
      this.witnesses = await this.request("get_witnesses");
      return this.witnesses;
    }
  }

  async getJoint(unit: string) {
    const { joint } = await this.request("get_joint", {
      unit
    });
    return joint;
  }

  async getBalances(addresses: string[]) {
    return await this.request("get_balances", { addresses });
  }

  async getProfileUnits(addresses: string[]) {
    return await this.request("get_profile_units", { addresses });
  }


  async getDataFeed(oracles: string[], feed_name: string, ifnone: string) {
    return await this.request("get_data_feed", { oracles, feed_name, ifnone });
  }

  async getHistory(addresses: string[], witnesses: string[], updateWitnesses = false) {
    const witnessesList = witnesses || await this.getWitnesses(updateWitnesses);

    return await this.request("get_history", { addresses, witnesses: witnessesList });
  }

  async getAttestation(attestor_address: string, field: string, value: string) {
    return await this.request("get_attestation", { attestor_address, field, value });
  }

  async getAttestations(address: string) {
    return await this.request("get_attestations", { address });
  }

  async getAaResponseChain(trigger_unit: string) {
    return await this.request("get_aa_response_chain", { trigger_unit });
  }

  async getAaResponses(aaOrAas: string | string[]) {
    const params: {
      aa?: string;
      aas?: string[];
    } = {};

    if (typeof aaOrAas === "string") {
      params.aa = aaOrAas;
    } else {
      params.aas = aaOrAas;
    }

    return await this.request("get_aa_responses", params);
  }

  async getAasByBaseAas(aaOrAas: string | string[]) {
    const params: {
      base_aa?: string;
      base_aas?: string[];
    } = {};

    if (typeof aaOrAas === "string") {
      params.base_aa = aaOrAas;
    } else {
      params.base_aas = aaOrAas;
    }

    return await this.request("get_aas_by_base_aas", params);
  }

  async dryRunAa(address: string, trigger: string) {
    return await this.request("dry_run_aa", {
      address,
      trigger,
    });
  }

  async getAaBalances(address: string) {
    return await this.request("get_aa_balances", { address }).then(data => data.balances);
  }
}

const client = new Client();

export const executeGetter = cache(async (address: string, getter: string, args: any[] = []) => {
  const data = await client.request("execute_getter", { address, getter, args });
  return data.result;
});

export const getDefinition = cache(async (address: string) => {
  return await client.request("get_definition", { address });
});

export const getAaStateVars = cache(async (address: string, var_prefix: string, var_prefix_from: string | undefined = undefined, var_prefix_to: string | undefined = undefined) => {
  return await client.request("get_aa_state_vars", { address, var_prefix, var_prefix_from, var_prefix_to });
})