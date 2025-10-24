import { appConfig } from "@/appConfig";
import { toLocalString } from "@/lib/to-local-string";
import { ReactNode } from "react";

type ValueTransformerMap = {
  [K in keyof AgentParams]: (value: AgentParams[K], frdToken: TokenMeta) => ReactNode;
};

export const truncateAddress = (value: string) => value.split(":").map(part => `${part.slice(0, 4)}...${part.slice(-4)}`);
const toPercentage = (value: number) => `${toLocalString(value * 100)}%`;
const toTokenAmount = (value: number, frdToken: TokenMeta) => `${toLocalString(value / 10 ** frdToken.decimals)} ${frdToken.symbol}`;

export const ADDRESS_PARAMS: (keyof AgentParams)[] = [
  'messaging_attestors',
  'real_name_attestors',
  'rewards_aa'
];

export const PERCENTAGE_PARAMS: (keyof AgentParams)[] = [
  'referrer_frd_deposit_reward_share',
  'referrer_bytes_deposit_reward_share',
  'referrer_deposit_asset_deposit_reward_share',
  'followup_reward_share'
];

const VALUE_TRANSFORMERS: Partial<ValueTransformerMap> = {
  // addresses
  ...Object.fromEntries(ADDRESS_PARAMS.map(param => [param, truncateAddress])),

  // percentages
  ...Object.fromEntries(PERCENTAGE_PARAMS.map(param => [param, toPercentage])),

  // specific
  min_balance_instead_of_real_name: toTokenAmount,
};

export const transformValue = <K extends keyof AgentParams>(key: K, value: AgentParams[K], frdToken: TokenMeta): ReactNode => {
  const transformer = VALUE_TRANSFORMERS[key];

  if (!transformer) return value;

  if (ADDRESS_PARAMS.includes(key)) {
    const formattedValue = (value as string).split(":");

    return <div className="flex gap-y-1 gap-x-3 flex-wrap">
      {formattedValue.map((item, index) => (
        <a
          href={`https://${appConfig.TESTNET ? 'testnet' : ''}explorer.obyte.org/address/${item}`}
          target="_blank"
          rel="noopener noreferrer"
          key={index}
          className="whitespace-nowrap mt-2 text-blue-700 font-normal inline-block"
        >
          {transformer(item as AgentParams[K], frdToken)}
        </a>
      ))}
    </div>;
  } else {
    return transformer(value as AgentParams[K], frdToken);
  }
}
