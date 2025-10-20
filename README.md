# react-native-conceal-crypto

A React Native library providing native C++ crypto utilities for Conceal blockchain, built with Nitro JSI modules.  
Includes both basic encryption and advanced elliptic curve cryptography.

## Features

- **ChaCha8/ChaCha12 encryption** - Fast symmetric encryption algorithms
- **libsodium secretbox** - Authenticated encryption with XSalsa20-Poly1305
- **HMAC-SHA1** - Message authentication for TOTP computation
- **Cryptonote elliptic curve operations** - Complete blockchain crypto primitives
- **Hex conversion** - Convert between hex strings and binary data
- **Cryptographically secure random** - Generate random data and mnemonic-style strings
- **Zero-copy ArrayBuffer** - High-performance binary data handling

## API Reference

### Encryption & Decryption
- `chacha8(input, key, iv)` - ChaCha8 stream cipher encryption
- `chacha12(input, key, iv)` - ChaCha12 stream cipher encryption  
- `secretbox(message, nonce, key)` - Authenticated encryption (XSalsa20-Poly1305)
- `secretboxOpen(ciphertext, nonce, key)` - Authenticated decryption (returns null on failure)

### Cryptonote Elliptic Curve Operations (Performance Optimized)
- `cryptonote.generateKeyDerivation(publicKey, secretKey)` - Generate key derivation (32-byte ArrayBuffer) ⚡
- `cryptonote.derivePublicKey(derivation, outputIndex, publicKey)` - Derive public key (32-byte ArrayBuffer) ⚡
- `cryptonote.geScalarmult(publicKey, secretKey)` - Scalar multiplication (32-byte ArrayBuffer) ⚡
- `cryptonote.geAdd(point1, point2)` - Add two elliptic curve points (32-byte ArrayBuffer) ⚡
- `cryptonote.geScalarmultBase(secretKey)` - Scalar multiplication with base point (32-byte ArrayBuffer) ⚡
- `cryptonote.geDoubleScalarmultBaseVartime(c, P, r)` - Double scalar multiplication c*P + r*G (32-byte ArrayBuffer) ⚡
- `cryptonote.geDoubleScalarmultPostcompVartime(r, P, c, I)` - Double scalar multiplication r*Pb + c*I (32-byte ArrayBuffer) ⚡

**Performance Features:**
- ⚡ **constexpr** validation for compile-time optimization
- ⚡ **Static thread-local buffers** to eliminate repeated allocations
- ⚡ **Zero-copy ArrayBuffer** operations for maximum speed
- ⚡ **Memory pre-allocation** for frequently called functions
- ⚡ **Inline functions** to reduce call overhead

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

// Cryptonote elliptic curve operations (optimized with ArrayBuffer)
const publicKeyBuf = concealCrypto.hextobin(publicKeyHex);
const secretKeyBuf = concealCrypto.hextobin(secretKeyHex);
const derivation = concealCrypto.cryptonote.generateKeyDerivation(publicKeyBuf, secretKeyBuf);
const derivedKey = concealCrypto.cryptonote.derivePublicKey(derivation, 0, publicKeyBuf);
const scalarMult = concealCrypto.cryptonote.geScalarmult(publicKeyBuf, secretKeyBuf);
const pointSum = concealCrypto.cryptonote.geAdd(point1Buf, point2Buf);
const baseMult = concealCrypto.cryptonote.geScalarmultBase(secretKeyBuf);
const doubleMult = concealCrypto.cryptonote.geDoubleScalarmultBaseVartime(cBuf, PBuf, rBuf);
const postcompMult = concealCrypto.cryptonote.geDoubleScalarmultPostcompVartime(rBuf, PBuf, cBuf, IBuf);

// Convert binary to hex
const hex = concealCrypto.bintohex(buffer);
```

## License

MIT
