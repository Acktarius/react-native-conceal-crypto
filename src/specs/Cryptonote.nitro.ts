import type { HybridObject } from 'react-native-nitro-modules';

/**
 * Cryptonote elliptic curve operations for blockchain operations
 * 
 * Performance-optimized: Uses hex strings for small inputs (<100 bytes) to avoid JSI ArrayBuffer overhead.
 * Following Nitro's recommendation: "Use hex/base64 strings for short scalar inputs like public keys"
 */
export interface Cryptonote extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
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
}

