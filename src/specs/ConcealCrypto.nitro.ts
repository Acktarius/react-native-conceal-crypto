import type { HybridObject } from 'react-native-nitro-modules';

export interface ConcealCrypto extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  // Example functions to expose to JS:
  hextobin(hex: string): ArrayBuffer;
  bintohex(buffer: ArrayBuffer): string;
  chacha8(input: ArrayBuffer, key: ArrayBuffer, iv: ArrayBuffer): ArrayBuffer;
  chacha12(input: ArrayBuffer, key: ArrayBuffer, iv: ArrayBuffer): ArrayBuffer;
  hmacSha1(key: ArrayBuffer, data: ArrayBuffer): ArrayBuffer;
  random(bits: number): string;
  randomBytes(bytes: number): ArrayBuffer;
  secretbox(message: ArrayBuffer, nonce: ArrayBuffer, key: ArrayBuffer): ArrayBuffer;
  secretboxOpen(ciphertext: ArrayBuffer, nonce: ArrayBuffer, key: ArrayBuffer): ArrayBuffer | null;
}
