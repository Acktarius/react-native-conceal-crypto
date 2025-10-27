import type { HybridObject } from 'react-native-nitro-modules';

/**
 * Cryptonote elliptic curve operations for blockchain operations
 *
 * Performance-optimized: Uses hex strings for small inputs (<100 bytes) to avoid JSI ArrayBuffer overhead.
 * Following Nitro's recommendation: "Use hex/base64 strings for short scalar inputs like public keys"
 */
export interface Cryptonote extends HybridObject<{ ios: 'c++'; android: 'c++' }> {
  /**
   * Generate a key derivation from a public key and secret key
   * @param publicKeyHex - 64-char hex string (32 bytes)
   * @param secretKeyHex - 64-char hex string (32 bytes)
   * @returns 64-char hex string - key derivation
   */
  generateKeyDerivation(publicKeyHex: string, secretKeyHex: string): string;

  /**
   * Derive a public key from a key derivation
   * @param derivationHex - 64-char hex string (32 bytes)
   * @param outputIndex - Output index number
   * @param publicKeyHex - 64-char hex string (32 bytes) - base public key
   * @returns 64-char hex string - derived public key
   */
  derivePublicKey(derivationHex: string, outputIndex: number, publicKeyHex: string): string;

  /**
   * Scalar multiplication of an elliptic curve point
   * @param publicKeyHex - 64-char hex string (32 bytes)
   * @param secretKeyHex - 64-char hex string (32 bytes)
   * @returns 64-char hex string - result point
   */
  geScalarmult(publicKeyHex: string, secretKeyHex: string): string;

  /**
   * Add two elliptic curve points
   * @param point1Hex - 64-char hex string (32 bytes)
   * @param point2Hex - 64-char hex string (32 bytes)
   * @returns 64-char hex string - sum point
   */
  geAdd(point1Hex: string, point2Hex: string): string;

  /**
   * Scalar multiplication of the base point
   * @param secretKeyHex - 64-char hex string (32 bytes)
   * @returns 64-char hex string - result point
   */
  geScalarmultBase(secretKeyHex: string): string;

  /**
   * Double scalar multiplication with base point: c*P + r*G
   * @param cHex - 64-char hex string (32 bytes)
   * @param PHex - 64-char hex string (32 bytes) - point
   * @param rHex - 64-char hex string (32 bytes)
   * @returns 64-char hex string - result point
   */
  geDoubleScalarmultBaseVartime(cHex: string, PHex: string, rHex: string): string;

  /**
   * Double scalar multiplication with precomputed point: r*Pb + c*I
   * where Pb = hash_to_ec(P)
   * @param rHex - 64-char hex string (32 bytes)
   * @param PHex - 64-char hex string (32 bytes) - point to hash to EC
   * @param cHex - 64-char hex string (32 bytes)
   * @param IHex - 64-char hex string (32 bytes) - point
   * @returns 64-char hex string - result point
   */
  geDoubleScalarmultPostcompVartime(rHex: string, PHex: string, cHex: string, IHex: string): string;

  /**
   * Keccak-256 hash function (CryptoNote fast hash)
   * One of the most frequently called functions in transaction processing!
   * Used for: hashing transactions, deriving scalars, address checksums, etc.
   *
   * Expected performance: 10-58x faster than JavaScript implementation
   *
   * @param inputHex - Hex string of any even length (input to hash)
   * @returns 64-char hex string (32 bytes) - Keccak-256 hash result
   *
   * @example
   * const hash = cryptonote.cnFastHash("48656c6c6f20576f726c64"); // "Hello World" in hex
   * // Returns: "592fa743889fc7f92ac2a37bb1f5ba1daf2a5c84741ca0e0061d243a2e6707ba"
   */
  cnFastHash(inputHex: string): string;

  /**
   * Encode an unsigned integer as a variable-length integer (varint)

   * Uses the Conceal/CryptoNote varint encoding:
   * - Values < 128: encoded as single byte
   * - Larger values: LEB128 encoding (7 bits per byte, MSB indicates continuation)
   *
   * @param value - Non-negative integer (0 to Number.MAX_SAFE_INTEGER = 2^53-1)
   * @returns Hex string representing the encoded varint (2-20 chars, 1-10 bytes)
   *
   * @throws Error if value is negative, fractional, or outside safe integer range
   *
   * @example
   * cryptonote.encodeVarint(0);      // Returns: "00"
   * cryptonote.encodeVarint(127);    // Returns: "7f" (1 byte)
   * cryptonote.encodeVarint(128);    // Returns: "8001" (2 bytes)
   * cryptonote.encodeVarint(1000);   // Returns: "e807" (2 bytes)
   * cryptonote.encodeVarint(100000); // Returns: "a08d06" (3 bytes)
   */
  encodeVarint(value: number): string;

  /**
   * Generate a ring signature for a transaction input
   *
   * Ring signatures provide anonymity by proving the signer knows one of N private keys
   * without revealing which one. Used in every CryptoNote transaction input.
   *
   * @param prefixHashHex - 64-char hex string (32 bytes) - transaction prefix hash
   * @param keyImageHex - 64-char hex string (32 bytes) - key image of the real input
   * @param publicKeysHex - Array of 64-char hex strings - ring member public keys (mixin + real)
   * @param secretKeyHex - 64-char hex string (32 bytes) - secret key of real input
   * @param secretIndex - Index of the real input in the ring (0 to publicKeysHex.length - 1)
   *
   * @returns Array of 128-char hex strings (64-byte signatures) - one per ring member
   *
   * @throws Error if inputs are invalid or secretIndex is out of range
   *
   * @example
   * const signatures = cryptonote.generateRingSignature(
   *   "a1b2c3...", // prefix hash
   *   "d4e5f6...", // key image
   *   ["pub1...", "pub2...", "pub3..."], // 3 ring members (mixin=2 + real)
   *   "secret...", // secret key
   *   1 // real input is at index 1
   * );
   * // Returns: ["sig1...", "sig2...", "sig3..."]
   */
  generateRingSignature(
    prefixHashHex: string,
    keyImageHex: string,
    publicKeysHex: string[],
    secretKeyHex: string,
    secretIndex: number
  ): string[];
}
