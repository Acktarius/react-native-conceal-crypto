/*
 * Copyright (c) 2025 Acktarius, Conceal Devs
 * 
 * This file is part of react-native-conceal-crypto.
 * 
 * Distributed under the MIT software license, see the accompanying
 * file LICENSE or http://www.opensource.org/licenses/mit-license.php.
 */
#include "HybridConcealCrypto.hpp"
#include "chacha.h"
#include "mn_random.h"
#include <sstream>
#include <iomanip>
#include <stdexcept>

using namespace margelo::nitro;
using namespace margelo::nitro::concealcrypto;

/**
 * Constructor — can init internal states or keys if needed.
 */
HybridConcealCrypto::HybridConcealCrypto() : HybridConcealCryptoSpec() {}

/**
 * Converts a hex string (e.g. "deadbeef") into binary bytes.
 */
std::shared_ptr<NitroModules::ArrayBuffer> HybridConcealCrypto::hextobin(const std::string& hex) {
  if (hex.size() % 2 != 0)
    throw std::invalid_argument("Hex string must have even length");

  std::vector<uint8_t> binary;
  binary.reserve(hex.size() / 2);

  for (size_t i = 0; i < hex.size(); i += 2) {
    std::string byteString = hex.substr(i, 2);
    char byte = static_cast<char>(strtol(byteString.c_str(), nullptr, 16));
    binary.push_back(static_cast<uint8_t>(byte));
  }
  
  return std::make_shared<NitroModules::ArrayBuffer>(binary.data(), binary.size());
}

/**
 * Converts binary bytes into a hex string.
 */
std::string HybridConcealCrypto::bintohex(const std::shared_ptr<NitroModules::ArrayBuffer>& buffer) {
  if (!buffer) throw std::invalid_argument("Buffer must not be null");
  
  std::ostringstream oss;
  oss << std::hex << std::setfill('0');
  
  const uint8_t* data = static_cast<const uint8_t*>(buffer->data());
  for (size_t i = 0; i < buffer->size(); ++i) {
    oss << std::setw(2) << static_cast<int>(data[i]);
  }
  
  return oss.str();
}

/**
 * ChaCha8 encryption.
 */
std::shared_ptr<NitroModules::ArrayBuffer> HybridConcealCrypto::chacha8(
  const std::shared_ptr<NitroModules::ArrayBuffer>& input,
  const std::shared_ptr<NitroModules::ArrayBuffer>& key,
  const std::shared_ptr<NitroModules::ArrayBuffer>& iv
) {
  if (!input || !key || !iv) 
    throw std::invalid_argument("Input, key and IV must not be null");
  if (key->size() != CHACHA_KEY_SIZE)
    throw std::invalid_argument("Key must be exactly 32 bytes");
  if (iv->size() != CHACHA_IV_SIZE)
    throw std::invalid_argument("IV must be exactly 8 bytes");

  // Allocate output buffer
  std::vector<uint8_t> output(input->size());
  
  // Call the modern ChaCha8 XOR function
  chacha8_xor(
    static_cast<const uint8_t*>(input->data()),   // input data
    input->size(),                                // input length
    static_cast<const uint8_t*>(key->data()),     // key
    static_cast<const uint8_t*>(iv->data()),     // iv
    output.data()                                 // output
  );

  return std::make_shared<NitroModules::ArrayBuffer>(output.data(), output.size());
}

/**
 * Real ChaCha12 encryption using Conceal Core implementation.
 */
std::shared_ptr<NitroModules::ArrayBuffer> HybridConcealCrypto::chacha12(
  const std::shared_ptr<NitroModules::ArrayBuffer>& input,
  const std::shared_ptr<NitroModules::ArrayBuffer>& key,
  const std::shared_ptr<NitroModules::ArrayBuffer>& iv
) {
  if (!input || !key || !iv) 
    throw std::invalid_argument("Input, key and IV must not be null");
  if (key->size() != CHACHA_KEY_SIZE)
    throw std::invalid_argument("Key must be exactly 32 bytes");
  if (iv->size() != CHACHA_IV_SIZE)
    throw std::invalid_argument("IV must be exactly 8 bytes");

  // Allocate output buffer
  std::vector<uint8_t> output(input->size());
  
  // Call the modern ChaCha12 XOR function
  chacha12_xor(
    static_cast<const uint8_t*>(input->data()),   // input data
    input->size(),                                // input length
    static_cast<const uint8_t*>(key->data()),     // key
    static_cast<const uint8_t*>(iv->data()),     // iv
    output.data()                                 // output
  );

  return std::make_shared<NitroModules::ArrayBuffer>(output.data(), output.size());
}

/**
 * HMAC-SHA1 implementation for TOTP computation
 */
std::shared_ptr<NitroModules::ArrayBuffer> HybridConcealCrypto::hmacSha1(
  const std::shared_ptr<NitroModules::ArrayBuffer>& key,
  const std::shared_ptr<NitroModules::ArrayBuffer>& data
) {
  return Hmac::hmacSha1(key, data);
}

/**
 * Clean JavaScript API for mnemonic-style random generation
 */
std::string HybridConcealCrypto::random(int bits) {
  return ::mn_random(bits);
}

/**
 * Clean JavaScript API for random bytes generation
 */
std::shared_ptr<NitroModules::ArrayBuffer> HybridConcealCrypto::randomBytes(int bytes) {
  std::vector<uint8_t> random_data = ::mn_random_bytes(bytes);
  return std::make_shared<NitroModules::ArrayBuffer>(random_data.data(), random_data.size());
}