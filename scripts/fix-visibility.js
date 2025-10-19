#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const NITROGEN_GENERATED_DIR = 'nitrogen/generated/android';

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  content = content.replace(/\binternal object\b/g, 'public object');
  content = content.replace(/\binternal companion object\b/g, 'public companion object');
  content = content.replace(/\binternal class\b/g, 'public class');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Patched visibility in: ${path.relative(process.cwd(), filePath)}`);
    return true;
  } else {
    console.log(`ℹ️  No changes needed in: ${path.relative(process.cwd(), filePath)}`);
    return false;
  }
}

function patchOnLoadCpp(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  OnLoad C++ file not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  // Add JNI_OnLoad if missing
  if (!content.includes('JNI_OnLoad')) {
    // Find the end of the namespace (before the last closing brace)
    const namespaceEnd = content.lastIndexOf('} // namespace margelo::nitro::concealcrypto');
    if (namespaceEnd !== -1) {
      const jniOnLoad = `
// JNI_OnLoad automatically calls initialize() when library loads
JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved) {
  return margelo::nitro::concealcrypto::initialize(vm);
}
`;
      content =
        content.slice(0, namespaceEnd) +
        '} // namespace margelo::nitro::concealcrypto\n' +
        jniOnLoad;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added JNI_OnLoad to C++ OnLoad file`);
    return true;
  } else {
    console.log(`ℹ️  JNI_OnLoad already present in C++ file`);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing Kotlin visibility modifiers and JNI_OnLoad...');

  const onLoadKtFile = path.join(
    NITROGEN_GENERATED_DIR,
    'kotlin/com/margelo/nitro/concealcrypto/ConcealCryptoOnLoad.kt'
  );
  const onLoadCppFile = path.join(NITROGEN_GENERATED_DIR, 'ConcealCryptoOnLoad.cpp');
  const filesToPatch = [
    path.join(
      NITROGEN_GENERATED_DIR,
      'kotlin/com/margelo/nitro/concealcrypto/HybridConcealCryptoSpec.kt'
    ),
  ];

  let patchedCount = 0;

  // Patch Kotlin OnLoad file (visibility only - no JNI bridge needed)
  if (patchFile(onLoadKtFile)) {
    patchedCount++;
  }

  // Patch C++ OnLoad file (add JNI_OnLoad)
  if (patchOnLoadCpp(onLoadCppFile)) {
    patchedCount++;
  }

  // Patch other files (visibility only)
  for (const file of filesToPatch) {
    if (patchFile(file)) {
      patchedCount++;
    }
  }

  console.log(`🎉 Successfully applied ${patchedCount} patch(es)`);
}

main();
