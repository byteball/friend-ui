// Local Obyte address validator without third-party libraries.
// Implements the chash validation used by Obyte for 160-bit (32-char) base32 addresses.
// All comments in English per user's preference.

const PI_DIGITS = "14159265358979323846264338327950288419716939937510";

function calcOffsets(chashLength: 160 | 288): number[] {
  const arrOffsets: number[] = [];
  let offset = 0;
  let index = 0;
  for (let i = 0; offset < chashLength; i += 1) {
    // guard against running out of PI_DIGITS, though current string is long enough
    if (i >= PI_DIGITS.length) throw new Error("PI_DIGITS exhausted");
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
  // Convert byte array to a binary string (bits)
  let s = "";
  for (let i = 0; i < buf.length; i++) {
    s += buf[i].toString(2).padStart(8, "0");
  }
  return s;
}

function binToBuffer(bin: string): Uint8Array {
  // Convert binary string (bits) back to bytes
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

// RFC 4648 Base32 (A-Z,2-7), uppercase expected, no padding for 32-char length
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
  return new Uint8Array(out);
}

/* ---------- Minimal synchronous SHA-256 (byte array in, byte array out) ---------- */
// Public-domain style compact implementation for Uint8Array input.
// Based on FIPS 180-4. No dependencies, browser-safe.

function sha256(bytes: Uint8Array): Uint8Array {
  // Initialize hash values (first 32 bits of the fractional parts of the square roots of the first 8 primes)
  let h0 = 0x6a09e667 | 0;
  let h1 = 0xbb67ae85 | 0;
  let h2 = 0x3c6ef372 | 0;
  let h3 = 0xa54ff53a | 0;
  let h4 = 0x510e527f | 0;
  let h5 = 0x9b05688c | 0;
  let h6 = 0x1f83d9ab | 0;
  let h7 = 0x5be0cd19 | 0;

  // Round constants (first 32 bits of the fractional parts of the cube roots of the first 64 primes)
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);

  // Helper bitwise ops
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  const ch = (x: number, y: number, z: number) => (x & y) ^ (~x & z);
  const maj = (x: number, y: number, z: number) => (x & y) ^ (x & z) ^ (y & z);
  const bsig0 = (x: number) => rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
  const bsig1 = (x: number) => rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
  const ssig0 = (x: number) => rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
  const ssig1 = (x: number) => rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);

  // Pre-processing (padding)
  const l = bytes.length;
  const bitLenHi = Math.floor((l >>> 29) & 0x07); // high 32 bits of bit length (only non-zero for very large inputs)
  const bitLenLo = (l << 3) >>> 0;                // low 32 bits of bit length

  // Message length in bytes after padding: original + 1 (0x80) + k zeros + 8 length bytes
  const padLen = ((56 - ((l + 1) % 64) + 64) % 64);
  const totalLen = l + 1 + padLen + 8;
  const m = new Uint8Array(totalLen);
  m.set(bytes, 0);
  m[l] = 0x80;
  // last 8 bytes: 64-bit big-endian message length
  // high 32 bits first
  m[totalLen - 8] = (bitLenHi >>> 24) & 0xff;
  m[totalLen - 7] = (bitLenHi >>> 16) & 0xff;
  m[totalLen - 6] = (bitLenHi >>> 8) & 0xff;
  m[totalLen - 5] = bitLenHi & 0xff;
  m[totalLen - 4] = (bitLenLo >>> 24) & 0xff;
  m[totalLen - 3] = (bitLenLo >>> 16) & 0xff;
  m[totalLen - 2] = (bitLenLo >>> 8) & 0xff;
  m[totalLen - 1] = bitLenLo & 0xff;

  // Process the message in successive 512-bit chunks
  const w = new Uint32Array(64);
  for (let i = 0; i < totalLen; i += 64) {
    // Prepare the message schedule w[0..63]
    for (let t = 0; t < 16; t++) {
      const j = i + t * 4;
      w[t] = ((m[j] << 24) | (m[j + 1] << 16) | (m[j + 2] << 8) | (m[j + 3])) >>> 0;
    }
    for (let t = 16; t < 64; t++) {
      w[t] = (ssig1(w[t - 2]) + w[t - 7] + ssig0(w[t - 15]) + w[t - 16]) >>> 0;
    }

    // Initialize working variables
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

    // Main compression function
    for (let t = 0; t < 64; t++) {
      const T1 = (h + bsig1(e) + ch(e, f, g) + K[t] + w[t]) >>> 0;
      const T2 = (bsig0(a) + maj(a, b, c)) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + T1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (T1 + T2) >>> 0;
    }

    // Add the compressed chunk to the current hash value
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  // Produce the final hash value (big-endian)
  const out = new Uint8Array(32);
  const write32be = (v: number, o: number) => {
    out[o] = (v >>> 24) & 0xff;
    out[o + 1] = (v >>> 16) & 0xff;
    out[o + 2] = (v >>> 8) & 0xff;
    out[o + 3] = v & 0xff;
  };
  write32be(h0, 0); write32be(h1, 4); write32be(h2, 8); write32be(h3, 12);
  write32be(h4, 16); write32be(h5, 20); write32be(h6, 24); write32be(h7, 28);
  return out;
}

/* ----------------------------- Public API ----------------------------- */

export function isValidAddress(address: string | null): boolean {
  // Fully synchronous validator
  if (typeof address !== "string") return false;
  if (address !== address.toUpperCase()) return false;
  if (address.length !== 32) return false; // Obyte addresses are 32-char base32

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

  // Compute SHA-256(cleanData) synchronously
  let digest: Uint8Array;
  try {
    digest = sha256(cleanData);
  } catch {
    return false;
  }

  // Take bytes [5, 13, 21, 29] as checksum and compare
  const expectedChecksum = new Uint8Array([digest[5], digest[13], digest[21], digest[29]]);
  if (expectedChecksum.length !== checksum.length) return false;
  for (let i = 0; i < checksum.length; i++) {
    if (expectedChecksum[i] !== checksum[i]) return false;
  }
  return true;
}