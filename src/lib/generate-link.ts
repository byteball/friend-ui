import { appConfig } from "@/app-config";
import { encodeData } from "./encode-data";


const suffixes = {
  livenet: "",
  testnet: "-tn",
};

const suffix = suffixes[appConfig.TESTNET ? "testnet" : "livenet"];

interface IGenerateLink {
  amount: number;
  aa: string;
  asset?: string;
  data: {
    [key: string]: number | string | boolean | object | undefined;
  };
  from_address?: string;
  is_single?: boolean;
}

export const generateLink = ({ amount, data, from_address, aa, asset = "base", is_single }: IGenerateLink): string => {
  let link = `obyte${suffix}:${aa}?amount=${Math.round(amount)}&asset=${encodeURIComponent(asset)}`;
  const encodedData = encodeData(data);

  if (data && encodedData !== null) link += "&base64data=" + encodeURIComponent(encodedData);
  if (from_address) link += "&from_address=" + encodeURIComponent(from_address);
  if (is_single) link += "&single_address=1";
  return link;
};

