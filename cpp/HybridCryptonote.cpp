/*
 * Copyright (c) 2025 Acktarius, Conceal Devs
 * 
 * This file is part of react-native-conceal-crypto.
 * 
 * Distributed under the MIT software license, see the accompanying
 * file LICENSE or http://www.opensource.org/licenses/mit-license.php.
 */
#include "HybridCryptonote.hpp"
#include <stdexcept>
#include <cstring>

// Include Conceal crypto headers
#include "Cryptonote/CryptoTypes.h"

// Forward declare crypto-ops functions
extern "C" {
  #include "Cryptonote/crypto-ops.h"
  void cn_fast_hash(const void *data, size_t length, char *hash);
}

// Forward declare crypto namespace functions
namespace crypto {
  bool generate_key_derivation(const PublicKey &key1, const SecretKey &key2, KeyDerivation &derivation);
  bool derive_public_key(const KeyDerivation &derivation, size_t output_index, const PublicKey &base, PublicKey &derived_key);
  void hash_to_ec(const PublicKey &key, KeyImage &res);
}

namespace margelo::nitro::concealcrypto {

// Initialize thread-local static buffers
thread_local std::array<uint8_t, CRYPTONOTE_KEY_SIZE> CryptonoteBuffers::key_buffer_1;
thread_local std::array<uint8_t, CRYPTONOTE_KEY_SIZE> CryptonoteBuffers::key_buffer_2;
thread_local std::array<uint8_t, CRYPTONOTE_DERIVATION_SIZE> CryptonoteBuffers::derivation_buffer;
thread_local std::array<uint8_t, CRYPTONOTE_POINT_SIZE> CryptonoteBuffers::point_buffer_1;
thread_local std::array<uint8_t, CRYPTONOTE_POINT_SIZE> CryptonoteBuffers::point_buffer_2;
thread_local std::array<uint8_t, CRYPTONOTE_POINT_SIZE> CryptonoteBuffers::result_buffer;

// TAG constant for HybridObject registration
constexpr auto TAG = "Cryptonote";

/**
 * Constructor — must call HybridObject(TAG) base constructor.
 */
HybridCryptonote::HybridCryptonote() : HybridObject(TAG) {}

// Optimized generateKeyDerivation with hex string inputs (minimizes JSI overhead)
std::string HybridCryptonote::generateKeyDerivation(
  const std::string& publicKeyHex,
  const std::string& secretKeyHex
) {
  // Fast validation
  if (!validateHexInput(publicKeyHex) || !validateHexInput(secretKeyHex)) {
    throw std::invalid_argument("Invalid hex string: must be 64 characters (32 bytes)");
  }

  // Use static buffers to avoid allocation
  crypto::PublicKey pub_key;
  crypto::SecretKey sec_key;
  crypto::KeyDerivation derivation;

  // Fast hex decode in C++ (much faster than JS)
  if (!cryptonote_utils::hextobin(publicKeyHex, pub_key.data, CRYPTONOTE_KEY_SIZE)) {
    throw std::invalid_argument("Invalid hex string format in publicKey");
  }
  if (!cryptonote_utils::hextobin(secretKeyHex, sec_key.data, CRYPTONOTE_KEY_SIZE)) {
    throw std::invalid_argument("Invalid hex string format in secretKey");
  }

  // Call optimized crypto function
  if (!crypto::generate_key_derivation(pub_key, sec_key, derivation)) {
    throw std::runtime_error("generate_key_derivation failed: invalid keys");
  }

  // Fast hex encode and return
  return cryptonote_utils::bintohex(derivation.data, CRYPTONOTE_DERIVATION_SIZE);
}

// Optimized derivePublicKey with hex string inputs
std::string HybridCryptonote::derivePublicKey(
  const std::string& derivationHex, 
  double outputIndex, 
  const std::string& publicKeyHex
) {
  // Fast validation
  if (!validateHexInput(derivationHex) || !validateHexInput(publicKeyHex)) {
    throw std::invalid_argument("Invalid hex string: must be 64 characters (32 bytes)");
  }

  // Use static buffers
  crypto::KeyDerivation deriv;
  crypto::PublicKey base_pub;
  crypto::PublicKey derived_key;

  // Fast hex decode
  if (!cryptonote_utils::hextobin(derivationHex, deriv.data, CRYPTONOTE_DERIVATION_SIZE)) {
    throw std::invalid_argument("Invalid hex string format in derivation");
  }
  if (!cryptonote_utils::hextobin(publicKeyHex, base_pub.data, CRYPTONOTE_KEY_SIZE)) {
    throw std::invalid_argument("Invalid hex string format in publicKey");
  }

  // Call optimized crypto function
  if (!crypto::derive_public_key(deriv, static_cast<size_t>(outputIndex), base_pub, derived_key)) {
    throw std::runtime_error("derive_public_key failed");
  }

  // Fast hex encode and return
  return cryptonote_utils::bintohex(derived_key.data, CRYPTONOTE_KEY_SIZE);
}

// Optimized geScalarmult with hex string inputs
std::string HybridCryptonote::geScalarmult(
  const std::string& publicKeyHex,
  const std::string& secretKeyHex
) {
  if (!validateHexInput(publicKeyHex) || !validateHexInput(secretKeyHex)) {
    throw std::invalid_argument("Invalid hex string: must be 64 characters (32 bytes)");
  }

  crypto::PublicKey pub_key;
  crypto::SecretKey sec_key;
  crypto::PublicKey result;

  if (!cryptonote_utils::hextobin(publicKeyHex, pub_key.data, CRYPTONOTE_KEY_SIZE)) {
    throw std::invalid_argument("Invalid hex string format in publicKey");
  }
  if (!cryptonote_utils::hextobin(secretKeyHex, sec_key.data, CRYPTONOTE_KEY_SIZE)) {
    throw std::invalid_argument("Invalid hex string format in secretKey");
  }

  // Perform pure scalar multiplication: result = sec_key * pub_key
  ge_p3 point;
  ge_p2 result_p2;
  
  // Convert public key bytes to ge_p3
  if (ge_frombytes_vartime(&point, reinterpret_cast<const unsigned char*>(&pub_key)) != 0) {
    throw std::invalid_argument("Invalid public key (not on curve)");
  }
  
  // Perform scalar multiplication
  ge_scalarmult(&result_p2, reinterpret_cast<const unsigned char*>(&sec_key), &point);
  
  // Convert result to bytes
  ge_tobytes(reinterpret_cast<unsigned char*>(&result), &result_p2);

  return cryptonote_utils::bintohex(result.data, CRYPTONOTE_POINT_SIZE);
}

// Optimized geAdd with hex string inputs
std::string HybridCryptonote::geAdd(
  const std::string& point1Hex,
  const std::string& point2Hex
) {
  if (!validateHexInput(point1Hex) || !validateHexInput(point2Hex)) {
    throw std::invalid_argument("Invalid hex string: must be 64 characters (32 bytes)");
  }

  crypto::PublicKey p1, p2, result;

  if (!cryptonote_utils::hextobin(point1Hex, p1.data, CRYPTONOTE_POINT_SIZE)) {
    throw std::invalid_argument("Invalid hex string format in point1");
  }
  if (!cryptonote_utils::hextobin(point2Hex, p2.data, CRYPTONOTE_POINT_SIZE)) {
    throw std::invalid_argument("Invalid hex string format in point2");
  }

  // Convert points to ge_p3 format
  ge_p3 point1, point2;
  if (ge_frombytes_vartime(&point1, reinterpret_cast<const unsigned char*>(&p1)) != 0) {
    throw std::invalid_argument("Invalid first point (not on curve)");
  }
  if (ge_frombytes_vartime(&point2, reinterpret_cast<const unsigned char*>(&p2)) != 0) {
    throw std::invalid_argument("Invalid second point (not on curve)");
  }

  // Convert point2 to cached format for addition
  ge_cached cached;
  ge_p3_to_cached(&cached, &point2);

  // Perform addition: point1 + point2
  ge_p1p1 sum;
  ge_add(&sum, &point1, &cached);

  // Convert result to p2 format
  ge_p2 result_p2;
  ge_p1p1_to_p2(&result_p2, &sum);

  // Convert to bytes
  ge_tobytes(reinterpret_cast<unsigned char*>(&result), &result_p2);

  return cryptonote_utils::bintohex(result.data, CRYPTONOTE_POINT_SIZE);
}

// Optimized geScalarmultBase with hex string inputs
std::string HybridCryptonote::geScalarmultBase(
  const std::string& secretKeyHex
) {
  if (!validateHexInput(secretKeyHex)) {
    throw std::invalid_argument("Invalid hex string: must be 64 characters (32 bytes)");
  }

  crypto::SecretKey sec_key;
  crypto::PublicKey result;

  if (!cryptonote_utils::hextobin(secretKeyHex, sec_key.data, CRYPTONOTE_KEY_SIZE)) {
    throw std::invalid_argument("Invalid hex string format in secretKey");
  }

  // Perform scalar multiplication with base point: result = sec_key * G
  ge_p3 point;
  ge_scalarmult_base(&point, reinterpret_cast<const unsigned char*>(&sec_key));
  
  // Convert ge_p3 to bytes
  ge_p3_tobytes(reinterpret_cast<unsigned char*>(&result), &point);

  return cryptonote_utils::bintohex(result.data, CRYPTONOTE_KEY_SIZE);
}

// Optimized geDoubleScalarmultBaseVartime with hex string inputs
// Computes: c*P + r*G (where G is the base point)
std::string HybridCryptonote::geDoubleScalarmultBaseVartime(
  const std::string& cHex,
  const std::string& PHex,
  const std::string& rHex
) {
  if (!validateHexInput(cHex) || !validateHexInput(PHex) || !validateHexInput(rHex)) {
    throw std::invalid_argument("Invalid hex string: must be 64 characters (32 bytes)");
  }

  crypto::SecretKey c_key, r_key;
  crypto::PublicKey P_point, result;

  if (!cryptonote_utils::hextobin(cHex, c_key.data, CRYPTONOTE_KEY_SIZE)) {
    throw std::invalid_argument("Invalid hex string format in c");
  }
  if (!cryptonote_utils::hextobin(PHex, P_point.data, CRYPTONOTE_POINT_SIZE)) {
    throw std::invalid_argument("Invalid hex string format in P");
  }
  if (!cryptonote_utils::hextobin(rHex, r_key.data, CRYPTONOTE_KEY_SIZE)) {
    throw std::invalid_argument("Invalid hex string format in r");
  }

  // Convert P to ge_p3 format
  ge_p3 point_P;
  if (ge_frombytes_vartime(&point_P, reinterpret_cast<const unsigned char*>(&P_point)) != 0) {
    throw std::invalid_argument("Invalid point P (not on curve)");
  }

  // Perform double scalar multiplication: c*P + r*G
  ge_p2 result_p2;
  ge_double_scalarmult_base_vartime(&result_p2, 
                                     reinterpret_cast<const unsigned char*>(&c_key), 
                                     &point_P, 
                                     reinterpret_cast<const unsigned char*>(&r_key));

  // Convert to bytes
  ge_tobytes(reinterpret_cast<unsigned char*>(&result), &result_p2);

  return cryptonote_utils::bintohex(result.data, CRYPTONOTE_POINT_SIZE);
}

// Optimized geDoubleScalarmultPostcompVartime with hex string inputs
// Computes: r*Pb + c*I (where Pb = hash_to_ec(P))
std::string HybridCryptonote::geDoubleScalarmultPostcompVartime(
  const std::string& rHex,
  const std::string& PHex,
  const std::string& cHex,
  const std::string& IHex
) {
  if (!validateHexInput(rHex) || !validateHexInput(PHex) || !validateHexInput(cHex) || !validateHexInput(IHex)) {
    throw std::invalid_argument("Invalid hex string: must be 64 characters (32 bytes)");
  }

  crypto::SecretKey r_key, c_key;
  crypto::PublicKey P_point, I_point, result;

  if (!cryptonote_utils::hextobin(rHex, r_key.data, CRYPTONOTE_KEY_SIZE)) {
    throw std::invalid_argument("Invalid hex string format in r");
  }
  if (!cryptonote_utils::hextobin(PHex, P_point.data, CRYPTONOTE_POINT_SIZE)) {
    throw std::invalid_argument("Invalid hex string format in P");
  }
  if (!cryptonote_utils::hextobin(cHex, c_key.data, CRYPTONOTE_KEY_SIZE)) {
    throw std::invalid_argument("Invalid hex string format in c");
  }
  if (!cryptonote_utils::hextobin(IHex, I_point.data, CRYPTONOTE_POINT_SIZE)) {
    throw std::invalid_argument("Invalid hex string format in I");
  }

  // Hash P to elliptic curve point (Pb)
  crypto::KeyImage image;
  crypto::hash_to_ec(P_point, image);

  // Convert Pb to ge_p3 format
  ge_p3 point_Pb;
  if (ge_frombytes_vartime(&point_Pb, reinterpret_cast<const unsigned char*>(&image)) != 0) {
    throw std::runtime_error("Failed to hash P to elliptic curve point");
  }

  // Convert I to ge_p3 format
  ge_p3 point_I;
  if (ge_frombytes_vartime(&point_I, reinterpret_cast<const unsigned char*>(&I_point)) != 0) {
    throw std::invalid_argument("Invalid point I (not on curve)");
  }

  // Precompute Pb for double scalar multiplication
  ge_dsmp dsmp;
  ge_dsm_precomp(dsmp, &point_Pb);

  // Perform double scalar multiplication: r*Pb + c*I
  ge_p2 result_p2;
  ge_double_scalarmult_precomp_vartime(&result_p2, 
                                        reinterpret_cast<const unsigned char*>(&r_key), 
                                        &point_I, 
                                        reinterpret_cast<const unsigned char*>(&c_key), 
                                        dsmp);

  // Convert to bytes
  ge_tobytes(reinterpret_cast<unsigned char*>(&result), &result_p2);

  return cryptonote_utils::bintohex(result.data, CRYPTONOTE_POINT_SIZE);
}

// Optimized cnFastHash (Keccak-256) with hex string input
// This is one of the most frequently called functions - used in every transaction!
std::string HybridCryptonote::cnFastHash(const std::string& inputHex) {
  // Validate hex input (must be even length)
  if (inputHex.length() % 2 != 0) {
    throw std::invalid_argument("Invalid hex string: must have even length");
  }

  // Convert hex to binary
  size_t dataLen = inputHex.length() / 2;
  std::vector<uint8_t> data(dataLen);
  
  if (!cryptonote_utils::hextobin(inputHex, data.data(), dataLen)) {
    throw std::invalid_argument("Invalid hex string format");
  }

  // Allocate 32-byte buffer for hash output (Keccak-256)
  uint8_t hash[32];

  // Call native Keccak-256 (cn_fast_hash from crypto-ops)
  cn_fast_hash(data.data(), dataLen, reinterpret_cast<char*>(hash));

  // Convert result to hex and return
  return cryptonote_utils::bintohex(hash, 32);
}

}  // namespace margelo::nitro::concealcrypto
