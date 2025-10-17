import type { HybridObject } from 'react-native-nitro-modules';
export interface ConcealCrypto extends HybridObject<{
    ios: 'swift';
    android: 'kotlin';
}> {
    hextobin(hex: string): ArrayBuffer;
    bintohex(buffer: ArrayBuffer): string;
    chacha8(input: ArrayBuffer, key: ArrayBuffer, iv: ArrayBuffer): ArrayBuffer;
}
//# sourceMappingURL=ConcealCrypto.nitro.d.ts.map