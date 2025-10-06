import { sha256 } from "js-sha256";

export function getHash(message: string): string {
  const hashBytes = sha256.array(message);
  return btoa(String.fromCharCode(...hashBytes));
}