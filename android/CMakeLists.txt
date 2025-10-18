cmake_minimum_required(VERSION 3.10.2)
project(ConcealCrypto)

# Compiler setup
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_VERBOSE_MAKEFILE ON)

# Library name must match androidCxxLibName in nitro.json
set(PACKAGE_NAME ConcealCrypto)

#---------------------------------------------
# 1. Add your native sources
#---------------------------------------------
add_library(${PACKAGE_NAME} SHARED
  ../cpp/install.cpp
  ../cpp/HybridConcealCrypto.cpp
  ../cpp/Hmac.cpp
  ../cpp/chacha8.c
)

#---------------------------------------------
# 2. Include directories for headers
#---------------------------------------------
include_directories(
  ../cpp
  ../nitrogen/generated/shared/c++
  ${CMAKE_SOURCE_DIR}/../node_modules/react-native-nitro-modules/cpp
)

#---------------------------------------------
# 3. Include Nitrogen‑generated autolinking setup
#---------------------------------------------
include(${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/ConcealCrypto+autolinking.cmake)

#---------------------------------------------
# 4. Find system libraries
#---------------------------------------------
find_library(LOG_LIB log)

#---------------------------------------------
# Optional: OpenSSL example (if used later)
# find_package(openssl REQUIRED CONFIG)
#---------------------------------------------

#---------------------------------------------
# 5. Link everything
#---------------------------------------------
target_link_libraries(
  ${PACKAGE_NAME}
  ${LOG_LIB}        # Android logcat logger
  android           # JNI core
  # fbjni::fbjni     # Only if autolinking didn’t add it
  # ReactAndroid::jsi # Usually auto‑linked by Nitro
  # openssl::crypto  # Uncomment if OpenSSL added
)
