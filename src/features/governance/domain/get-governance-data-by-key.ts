import { getHash } from "@/lib/get-hash";

export interface IGovernanceItemData<T extends string | number | symbol> {
  challenging_period_start_ts?: number;
  choices: Record<string, T>;
  leader?: T;
  supports: Record<T, number>;
}

export const getGovernanceDataByKey = <K extends keyof AgentParams>(key: K, governanceState: Record<string, any>) => {
  const data: IGovernanceItemData<AgentParams[K]> = {
    choices: {},
    supports: {} as Record<AgentParams[K], number>,
  };

  const hashToValue: Record<string, string> = {};

  Object.entries(governanceState).forEach(([varKey, value]) => {
    if (varKey === `challenging_period_start_ts_${key}`) {
      data.challenging_period_start_ts = value as number;
    } else if (varKey.startsWith("choice_") && varKey.endsWith(`_${key}`)) {
      const splitted = varKey.split("_");
      const address = splitted[1];
      data.choices[address] = value as AgentParams[K];

      if (varKey.includes("messaging_attestors")) {
        const hash = getHash(value as string)
        hashToValue[hash] = value as string;
      }

    } else if (varKey === `leader_${key}`) {
      data.leader = value as AgentParams[K];
    } else if (varKey.startsWith(`support_${key}_`)) {
      const splitted = varKey.split("_");
      const supportedValue = splitted[splitted.length - 1];
      data.supports[supportedValue as AgentParams[K]] = value as number;
    };
  });

  if (key === "messaging_attestors" && data.supports) {
    Object.entries(data.supports).forEach(([hashKey, value]) => {
      const realValue = hashToValue[hashKey] as string;

      // @ts-expect-error IDN
      data.supports[realValue] = value as AgentParams[K];

      // @ts-expect-error IDN
      delete data.supports[hashKey];
    });
  }

  return data;
}