require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'ConcealCrypto'  # Match iosModuleName from nitro.json
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = package['homepage']
  s.license      = package['license']
  s.author       = package['author']
  s.platforms    = { :ios => '15.1' }
  s.source       = { :git => package['repository']['url'], :tag => "v#{s.version}" }

  # C++ implementation files (matching CMakeLists.txt structure)
  s.source_files = [
    'cpp/**/*.{h,hpp,cpp,c,mm}',
  ]

  # Load Nitrogen autolinking (adds generated files + NitroModules dependency)
  load 'nitrogen/generated/ios/ConcealCrypto+autolinking.rb'
  add_nitrogen_files(s)

  # Dependencies
  s.dependency 'React-Core'
  s.dependency 'libsodium', '~> 1.0.18'

  # iOS-specific compiler settings
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20',
    'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'i386'
  }
end

