import fs from 'node:fs';

const CMAKELISTS_FILE = 'android/CMakeLists.txt';

function fixPrefabBug() {
  console.log('🔧 Applying manual fix for Nitrogen Prefab export bug...');

  if (!fs.existsSync(CMAKELISTS_FILE)) {
    console.warn(`⚠️  CMakeLists.txt not found: ${CMAKELISTS_FILE}`);
    return false;
  }

  let content = fs.readFileSync(CMAKELISTS_FILE, 'utf8');

  // Check if the manual fix is already present
  if (content.includes('Manual fix for Prefab export bug')) {
    console.info(`ℹ️  Prefab bug fix already present in: ${CMAKELISTS_FILE}`);
    return false;
  }

  // Add the manual fix after the find_package line
  const manualFix = `
# Manual fix for local import Prefab bug - locate NitroModules manually since find_package fails
set(NODE_MODULES_DIR "\${CMAKE_SOURCE_DIR}/../example/node_modules")

add_library(nitro_modules SHARED IMPORTED)
set_target_properties(nitro_modules PROPERTIES
    IMPORTED_LOCATION "\${NODE_MODULES_DIR}/react-native-nitro-modules/android/build/intermediates/prefab_package/debug/prefab/react-native-nitro-modules/libs/\${ANDROID_ABI}/libNitroModules.so"
    INTERFACE_INCLUDE_DIRECTORIES "\${NODE_MODULES_DIR}/react-native-nitro-modules/android/build/intermediates/prefab_package/debug/prefab/react-native-nitro-modules/include"
)
`;

  // Insert the fix after the find_package line
  const findPackageRegex = /find_package\(react-native-nitro-modules REQUIRED CONFIG\)/;
  if (findPackageRegex.test(content)) {
    content = content.replace(findPackageRegex, `$&${manualFix}`);
  } else {
    console.warn('⚠️  Could not find find_package line to insert fix after');
    return false;
  }

  // Update the target_link_libraries to use nitro_modules instead of react-native-nitro-modules::NitroModules
  const linkRegex = /react-native-nitro-modules::NitroModules/g;
  if (linkRegex.test(content)) {
    content = content.replace(
      linkRegex,
      'nitro_modules     # Nitro Modules Core (manual fix for Prefab bug)'
    );
  }

  fs.writeFileSync(CMAKELISTS_FILE, content);

  console.log(`✅ Applied Prefab bug fix to: ${CMAKELISTS_FILE}`);
  return true;
}

function main() {
  const fixed = fixPrefabBug();

  if (fixed) {
    console.log('🎉 Prefab bug fix applied successfully!');
  } else {
    console.log('ℹ️  No Prefab bug fix needed');
  }
}

main();
