/*
 * Copyright (c) 2025 Acktarius, Conceal Devs
 * 
 * This file is part of react-native-conceal-crypto.
 * 
 * Distributed under the MIT software license, see the accompanying
 * file LICENSE or http://www.opensource.org/licenses/mit-license.php.
 */
#pragma once
#include "../nitrogen/generated/shared/c++/HybridConcealCryptoSpec.hpp"
#include <vector>
#include <string>

namespace margelo::nitro::concealcrypto {

class HybridConcealCrypto : public HybridConcealCryptoSpec {
 public:
  HybridConcealCrypto();

  // Functions declared in your TypeScript Nitro spec
  std::shared_ptr<NitroModules::ArrayBuffer> hextobin(const std::string& hex) override;
  std::string bintohex(const std::shared_ptr<NitroModules::ArrayBuffer>& buffer) override;
  std::shared_ptr<NitroModules::ArrayBuffer> chacha8(const std::shared_ptr<NitroModules::ArrayBuffer>& input,
                                                      const std::shared_ptr<NitroModules::ArrayBuffer>& key,
                                                      const std::shared_ptr<NitroModules::ArrayBuffer>& iv) override;
};

}  // namespace margelo::nitro::concealcrypto
