import fs from 'node:fs';

const AUTOLINKING_FILE = 'nitrogen/generated/android/ConcealCrypto+autolinking.cmake';

function fixCMakeLinking() {
  console.log('🔧 Fixing CMake linking for NitroModules...');

  if (!fs.existsSync(AUTOLINKING_FILE)) {
    console.warn(`⚠️  Autolinking file not found: ${AUTOLINKING_FILE}`);
    return false;
  }

  let content = fs.readFileSync(AUTOLINKING_FILE, 'utf8');

  // Check if NitroModules linking is already present
  if (content.includes('react-native-nitro-modules::NitroModules')) {
    console.info(`ℹ️  NitroModules linking already present in: ${AUTOLINKING_FILE}`);
    return false;
  }

  // Add the NitroModules linking
  const nitroLinkingFix = `
# Manual fix for NitroModules linking (added by fix-cmake-linking.js)
find_package(react-native-nitro-modules REQUIRED CONFIG)
target_link_libraries(\${PACKAGE_NAME} react-native-nitro-modules::NitroModules)
`;

  content += nitroLinkingFix;
  fs.writeFileSync(AUTOLINKING_FILE, content);

  console.log(`✅ Added NitroModules linking to: ${AUTOLINKING_FILE}`);
  return true;
}

function main() {
  const fixed = fixCMakeLinking();

  if (fixed) {
    console.log('🎉 CMake linking fix applied successfully!');
  } else {
    console.log('ℹ️  No CMake linking fix needed');
  }
}

main();
