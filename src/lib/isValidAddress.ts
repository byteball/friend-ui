// Local Obyte address validator without third-party libraries.
// Implements the chash validation used by Obyte for 160-bit (32-char) base32 addresses.

const PI_DIGITS = "14159265358979323846264338327950288419716939937510";

function calcOffsets(chashLength: 160 | 288): number[] {
  const arrOffsets: number[] = [];
  let offset = 0;
  let index = 0;
  for (let i = 0; offset < chashLength; i += 1) {
    const relativeOffset = parseInt(PI_DIGITS[i], 10);
    if (relativeOffset !== 0) {
      offset += relativeOffset;
      if (chashLength === 288) offset += 4;
      if (offset >= chashLength) break;
      arrOffsets.push(offset);
      index += 1;
    }
  }
  if (index !== 32) throw new Error("wrong number of checksum bits");
  return arrOffsets;
}

const arrOffsets160 = calcOffsets(160);
const arrOffsets288 = calcOffsets(288);

function bufferToBin(buf: Uint8Array): string {
  let s = "";
  for (let i = 0; i < buf.length; i++) {
    const bin = buf[i].toString(2).padStart(8, "0");
    s += bin;
  }
  return s;
}

function binToBuffer(bin: string): Uint8Array {
  const len = Math.floor(bin.length / 8);
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = parseInt(bin.substr(i * 8, 8), 2);
  }
  return out;
}

function separateIntoCleanDataAndChecksum(bin: string) {
  const len = bin.length;
  let arrOffsets: number[];
  if (len === 160) arrOffsets = arrOffsets160;
  else if (len === 288) arrOffsets = arrOffsets288;
  else throw new Error(`bad length=${len}, bin=${bin}`);

  const frags: string[] = [];
  const checksumBits: string[] = [];
  let start = 0;
  for (let i = 0; i < arrOffsets.length; i++) {
    frags.push(bin.substring(start, arrOffsets[i]));
    checksumBits.push(bin.substr(arrOffsets[i], 1));
    start = arrOffsets[i] + 1;
  }
  if (start < bin.length) frags.push(bin.substring(start));
  return { cleanData: frags.join(""), checksum: checksumBits.join("") };
}

// RFC 4648 Base32 (A-Z,2-7), uppercase expected, no padding for 32-ch length
function base32Decode(input: string): Uint8Array | null {
  const map: { [k: string]: number } = {};
  for (let i = 0; i < 26; i++) map[String.fromCharCode(65 + i)] = i; // A-Z
  for (let i = 0; i < 6; i++) map[String(2 + i)] = 26 + i; // 2-7

  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const v = map[ch];
    if (v === undefined) return null;
    value = (value << 5) | v;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((value >>> bits) & 0xff);
    }
  }
  // No padding. For length 32, we expect to decode to 20 bytes.
  return new Uint8Array(out);
}

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  // Create a fresh ArrayBuffer to avoid ArrayBufferLike / SharedArrayBuffer typing issues
  const ab = new ArrayBuffer(view.byteLength);
  new Uint8Array(ab).set(view);
  return ab;
}

export async function isValidAddress(address: string): Promise<boolean> {
  if (typeof address !== "string") return false;
  if (address !== address.toUpperCase()) return false;
  if (address.length !== 32) return false; // Obyte addresses are 32-char base32

  // decode (base32)
  const chash = base32Decode(address);
  if (!chash) return false;

  const binChash = bufferToBin(chash);
  let separated: { cleanData: string; checksum: string };
  try {
    separated = separateIntoCleanDataAndChecksum(binChash);
  } catch {
    return false;
  }

  const cleanData = binToBuffer(separated.cleanData);
  const checksum = binToBuffer(separated.checksum);

  try {
    // Pass a tightly-sliced ArrayBuffer to satisfy TS/dom BufferSource
    const expectedFull = await crypto.subtle.digest("SHA-256", toArrayBuffer(cleanData));
    const expected = new Uint8Array(expectedFull);
    const expectedChecksum = new Uint8Array([expected[5], expected[13], expected[21], expected[29]]);
    if (expectedChecksum.length !== checksum.length) return false;
    for (let i = 0; i < checksum.length; i++) {
      if (expectedChecksum[i] !== checksum[i]) return false;
    }
    return true;
  } catch {
    return false;
  }
}
