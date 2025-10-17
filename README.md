# react-native-conceal-crypto

A React Native library providing native C++ crypto utilities for Conceal blockchain, built with Nitro JSI modules.

## Features

- **ChaCha8 encryption** - Fast symmetric encryption
- **Hex conversion** - Convert between hex strings and binary data
- **Zero-copy ArrayBuffer** - High-performance binary data handling

## Installation

```bash
npm install github:Acktarius/react-native-conceal-crypto

```

## Usage

```typescript
import concealCrypto from 'react-native-conceal-crypto';

// Convert hex to binary
const buffer = concealCrypto.hextobin('deadbeef');

// Encrypt data
const encrypted = concealCrypto.chacha8(input, key, iv);

// Convert binary to hex
const hex = concealCrypto.bintohex(buffer);
```

## License

MIT
