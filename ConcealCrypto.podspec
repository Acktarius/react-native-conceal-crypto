require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::UI.puts "[ConcealCrypto] 🔐 Cryptonote crypto powered by C++"

Pod::Spec.new do |s|
  s.name         = 'ConcealCrypto'  # Match iosModuleName from nitro.json
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = package['homepage']
  s.license      = package['license']
  s.author       = package['author']
  s.platforms    = { :ios => '15.1' }
  s.ios.deployment_target = '15.1'
  s.source       = { :git => package['repository']['url'], :tag => "v#{s.version}" }

  # C++ implementation files (matching CMakeLists.txt structure)
  s.source_files = [
    'cpp/**/*.{h,hpp,cpp,c,mm}',
  ]

  # iOS-specific compiler settings (set BEFORE nitrogen autolinking)
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20',
    'CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES' => 'YES'
  }

  # Load Nitrogen autolinking (adds generated files + NitroModules dependency)
  # This will merge with pod_target_xcconfig set above
  load 'nitrogen/generated/ios/ConcealCrypto+autolinking.rb'
  add_nitrogen_files(s)

  # Dependencies
  s.dependency 'React-Core'
  s.dependency 'libsodium', '~> 1.0'
  
  install_modules_dependencies(s)
end

