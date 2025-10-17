require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name          = "react-native-conceal-crypto"
  s.version       = package["version"]
  s.summary       = package["description"]
  s.homepage      = package["homepage"]
  s.license       = package["license"]
  s.author        = package["author"]
  s.platforms     = { :ios => "12.0" }

  s.source        = { :git => package["repository"]["url"], :tag => "#{s.version}" }
  s.source_files  = [
    "ios/**/*.{h,m,mm,swift,cpp,hpp}",
    "cpp/**/*.{h,cpp}"
  ]

  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'HEADER_SEARCH_PATHS' => '"$(PODS_ROOT)/boost" "$(PODS_ROOT)/React-Core/ReactCommon"'
  }

  s.dependency "React-Core"

  # Optionally include Nitro core runtime
  s.dependency "react-native-nitro-modules"
end
