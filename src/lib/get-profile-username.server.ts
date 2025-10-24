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

    if (store.tgAttestations.has(address)) {
      return store.tgAttestations.get(address) || null;
    }

    const attestations = await client.api.getAttestations({ address }).catch(() => null);
    if (!attestations) return address.slice(0, 6) + "..." + address.slice(-4);

    // @ts-expect-error not error
    const telegramName = attestations.find(att => att.attestor_address === appConfig.NEXT_PUBLIC_TELEGRAM_ATTESTOR)?.profile?.username as string | undefined;

    if (telegramName) {
      store.tgAttestations.set(address, telegramName);

      return telegramName;
    }

    if (store.discordAttestations.has(address)) {
      return store.discordAttestations.get(address) || null;
    }

    // @ts-expect-error not error
    const discordName = attestations.find(att => att.attestor_address === appConfig.NEXT_PUBLIC_DISCORD_ATTESTOR)?.profile?.username as string | undefined;


    if (discordName) {
      store.discordAttestations.set(address, discordName);

      return discordName;
    }

    throw new Error("no attestations found");

  } catch (e) {
    console.error("error(getProfileUsername):", e);
  }

  return address.slice(0, 6) + "..." + address.slice(-4);
}