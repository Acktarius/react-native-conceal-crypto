module.exports = {
  dependency: {
    platforms: {
      ios: { podspecPath: 'react-native-conceal-crypto.podspec' },
      android: {
        sourceDir: './android',
        packageImportPath: 'import com.margelo.nitro.concealcrypto.ConcealCryptoPackage;',
        packageInstance: 'new ConcealCryptoPackage()',
      },
    },
  },
};
