import { appConfig } from "@/app-config";

type ExplorerUnitType = "address" | "tx" | "asset";

export const getExplorerUrl = (value: string, type: ExplorerUnitType | undefined = "tx"): string => {
  let baseUrl = `https://${appConfig.TESTNET ? "testnet" : ""}explorer.obyte.org/`;

  if (type === "address") {
    baseUrl += "address/" + value;
  } else if (type === "asset") {
    baseUrl += "asset/" + encodeURIComponent(value);
  } else if (type === "tx") {
    baseUrl += encodeURIComponent(value);
  } else {
    throw new Error("Invalid explorer type");
  }

  return baseUrl;
};