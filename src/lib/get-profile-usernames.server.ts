import "server-only";
import { getProfileUsername } from "./getProfileUsername.server";

export const getProfileUsernames = async (addresses: string[]) => {

  const usernameGetters = addresses.map((address) => getProfileUsername(address)
    .then((username) => ({ address, username })).catch(() => ({ address, username: address })));

  return Promise.all(usernameGetters);
}