/*
 * Copyright (c) 2025 Acktarius, Conceal Devs
 * 
 * This file is part of react-native-conceal-crypto.
 * 
 * Distributed under the MIT software license, see the accompanying
 * file LICENSE or http://www.opensource.org/licenses/mit-license.php.
 */
#pragma once
#include <NitroModules/ArrayBuffer.hpp>
#include <memory>
#include <string>
#include <vector>

namespace margelo::nitro::concealcrypto {

/**
 * HMAC-SHA1 implementation following RFC 2104 and FIPS 198-1
 * Used for TOTP computation and other cryptographic operations
 */
class Hmac {
public:
  /**
   * Compute HMAC-SHA1 of data using the provided key
   * @param key The secret key as ArrayBuffer
   * @param data The message data as ArrayBuffer
   * @return HMAC-SHA1 result as ArrayBuffer (20 bytes)
   */
  static std::shared_ptr<NitroModules::ArrayBuffer> hmacSha1(
    const std::shared_ptr<NitroModules::ArrayBuffer>& key,
    const std::shared_ptr<NitroModules::ArrayBuffer>& data
  );

private:
  // Performance optimization: pre-allocated buffers to reduce heap churn
  static thread_local std::vector<uint8_t> scratchBuffer;
  static constexpr size_t MAX_SCRATCH_SIZE = 1024; // Reasonable upper bound for most use cases
  
  /**
   * Get or resize scratch buffer for reuse
   * @param requiredSize Minimum size needed
   * @return Reference to scratch buffer
   */
  static std::vector<uint8_t>& getScratchBuffer(size_t requiredSize);

private:
  /**
   * SHA-1 hash function implementation
   * @param data Input data to hash
   * @return SHA-1 hash as vector of bytes (20 bytes)
   */
  static std::vector<uint8_t> sha1(const std::vector<uint8_t>& data);

  /**
   * Left rotate operation for SHA-1
   * @param value Value to rotate
   * @param amount Number of bits to rotate left
   * @return Rotated value
   */
  static constexpr uint32_t leftRotate(uint32_t value, int amount) noexcept;

  /**
   * Convert ArrayBuffer to vector of bytes
   * @param buffer Input ArrayBuffer
   * @return Vector of bytes
   */
  static std::vector<uint8_t> arrayBufferToVector(const std::shared_ptr<NitroModules::ArrayBuffer>& buffer);

  /**
   * Convert vector of bytes to ArrayBuffer
   * @param data Vector of bytes
   * @return ArrayBuffer
   */
  static std::shared_ptr<NitroModules::ArrayBuffer> vectorToArrayBuffer(const std::vector<uint8_t>& data);
};

} // namespace margelo::nitro::concealcrypto
