# react-native-conceal-crypto

A React Native library providing native C++ crypto utilities for Conceal blockchain, built with Nitro JSI modules.

## Features

- **ChaCha8/ChaCha12 encryption** - Fast symmetric encryption algorithms
- **libsodium secretbox** - Authenticated encryption with XSalsa20-Poly1305
- **HMAC-SHA1** - Message authentication for TOTP computation
- **Hex conversion** - Convert between hex strings and binary data
- **Cryptographically secure random** - Generate random data and mnemonic-style strings
- **Zero-copy ArrayBuffer** - High-performance binary data handling

## API Reference

### Encryption & Decryption
- `chacha8(input, key, iv)` - ChaCha8 stream cipher encryption
- `chacha12(input, key, iv)` - ChaCha12 stream cipher encryption  
- `secretbox(message, nonce, key)` - Authenticated encryption (XSalsa20-Poly1305)
- `secretboxOpen(ciphertext, nonce, key)` - Authenticated decryption (returns null on failure)

### Data Conversion
- `hextobin(hex)` - Convert hex string to ArrayBuffer
- `bintohex(buffer)` - Convert ArrayBuffer to hex string

### Random Generation
- `random(bits)` - Generate cryptographically secure random string
- `randomBytes(bytes)` - Generate random bytes as ArrayBuffer

### Authentication
- `hmacSha1(key, data)` - HMAC-SHA1 message authentication

## Installation

```bash
npm pack
npm install file:react-native-conceal-crypto-0.x.x.tgz

```

## Usage

```typescript
import concealCrypto from 'react-native-conceal-crypto';

// Convert hex to binary
const buffer = concealCrypto.hextobin('deadbeef');

// Encrypt data with ChaCha8
const encrypted = concealCrypto.chacha8(input, key, iv);

// Authenticated encryption with libsodium
const ciphertext = concealCrypto.secretbox(message, nonce, key);
const decrypted = concealCrypto.secretboxOpen(ciphertext, nonce, key);

// Generate random data
const randomStr = concealCrypto.random(256);
const randomBytes = concealCrypto.randomBytes(32);

// Convert binary to hex
const hex = concealCrypto.bintohex(buffer);
```

## License

MIT
