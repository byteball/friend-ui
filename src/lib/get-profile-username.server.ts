import "server-only";

import { appConfig } from "@/app-config";

export const getProfileUsername = async (address: string): Promise<string | null> => {
  const client = globalThis.__OBYTE_CLIENT__;

  if (!client) {
    console.error("error(getProfileUsername): obyte client missing");
    return null;
  }

  const store = globalThis.__GLOBAL_STORE__;
  if (!store) {
    console.error("error(getProfileUsername): global store missing");
    return null;
  }

  try {
    const cityName = await client.api.getAaStateVars({ address: appConfig.NEXT_PUBLIC_CITY_AA_ADDRESS, var_prefix: `user_${address}` }).then(({ vars }: { [key: string]: any }) => vars[`user_${address}`]?.name as string | undefined).catch(() => undefined);

    if (cityName) return cityName;

    const tgAttestation = await store.getTgAttestation(address);

    if (tgAttestation && tgAttestation?.username) {
      return tgAttestation.username;
    }

    const discordAttestation = await store.getDiscordAttestation(address);

    if (discordAttestation && discordAttestation?.username) {
      return discordAttestation.username;
    }


  } catch (error) {
    console.error("error(getProfileUsername):", error);

    return address.slice(0, 6) + "..." + address.slice(-4);
  }

  return address.slice(0, 6) + "..." + address.slice(-4);
}