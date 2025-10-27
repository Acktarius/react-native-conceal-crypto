require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ReactNativeConcealCrypto'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platforms      = {
    :ios => '15.1',
    :tvos => '15.1'
  }
  s.swift_version  = '5.9'
  s.source          = { :path => "." }
  s.static_framework = true

  # Add C++ source files
  s.source_files = [
    'cpp/**/*.{cpp,hpp,h,mm}'
  ]

  # Load Nitrogen autolinking helper
  load 'nitrogen/generated/ios/ConcealCrypto+autolinking.rb'
  add_nitrogen_files(s)

  # Additional iOS configuration
  s.pod_target_xcconfig = s.pod_target_xcconfig.merge({
    'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'arm64',
    'SWIFT_VERSION' => '5.9',
  })

end
