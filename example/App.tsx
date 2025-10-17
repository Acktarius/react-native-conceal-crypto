import React, { useState } from 'react';
import { Button, SafeAreaView, ScrollView, Text, View, TextInput, Alert } from 'react-native';
import concealCrypto from 'react-native-conceal-crypto';

export default function App() {
  const [inputText, setInputText] = useState('Hello, Conceal Crypto!');
  const [keyText, setKeyText] = useState('deadbeefcafebabe1234567890abcdef1234567890abcdef1234567890abcdef12');
  const [ivText, setIvText] = useState('1234567890abcdef');
  const [result, setResult] = useState('');

  const testChacha8 = async () => {
    try {
      // Convert strings to ArrayBuffers
      const inputBuffer = new TextEncoder().encode(inputText).buffer;
      const keyBuffer = concealCrypto.hextobin(keyText);
      const ivBuffer = concealCrypto.hextobin(ivText);

      // Encrypt with chacha8
      const encryptedBuffer = concealCrypto.chacha8(inputBuffer, keyBuffer, ivBuffer);
      
      // Convert back to hex for display
      const encryptedHex = concealCrypto.bintohex(encryptedBuffer);
      
      // Decrypt (XOR is symmetric)
      const decryptedBuffer = concealCrypto.chacha8(encryptedBuffer, keyBuffer, ivBuffer);
      const decryptedText = new TextDecoder().decode(decryptedBuffer);
      
      setResult(`Encrypted: ${encryptedHex}\nDecrypted: ${decryptedText}`);
    } catch (error) {
      Alert.alert('Error', `Crypto operation failed: ${(error as Error).message}`);
    }
  };

  const testHexConversion = () => {
    try {
      const hexString = 'deadbeef';
      const buffer = concealCrypto.hextobin(hexString);
      const backToHex = concealCrypto.bintohex(buffer);
      setResult(`Original: ${hexString}\nConverted back: ${backToHex}`);
    } catch (error) {
      Alert.alert('Error', `Hex conversion failed: ${(error as Error).message}`);
    }
  };

  const testHmacSha1 = () => {
    try {
      // Test HMAC-SHA1 with known test vectors
      const key = concealCrypto.hextobin('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b');
      const data = new TextEncoder().encode('Hi There');
      const hmacResult = concealCrypto.hmacSha1(key, data.buffer);
      const hmacHex = concealCrypto.bintohex(hmacResult);
      
      // Expected result for RFC 2202 test case 1
      const expected = 'b617318655057264e28bc0b6fb378c8ef146be00';
      
      setResult(`HMAC-SHA1 Test:\nKey: 0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b\nData: "Hi There"\nResult: ${hmacHex}\nExpected: ${expected}\nMatch: ${hmacHex.toLowerCase() === expected}`);
    } catch (error) {
      Alert.alert('Error', `HMAC-SHA1 test failed: ${(error as Error).message}`);
    }
  };

  const testHmacSha1Rfc2202 = () => {
    try {
      // RFC 2202 Test Case 1: "key" and "The quick brown fox jumps over the lazy dog"
      const key = new TextEncoder().encode('key');
      const data = new TextEncoder().encode('The quick brown fox jumps over the lazy dog');
      const hmacResult = concealCrypto.hmacSha1(key.buffer, data.buffer);
      const hmacHex = concealCrypto.bintohex(hmacResult);
      
      // Expected result from RFC 2202
      const expected = 'de7c9b85b8b78aa6bc8a7a36f70a90701c9db4d9';
      
      setResult(`RFC 2202 Test Case:\nKey: "key"\nData: "The quick brown fox jumps over the lazy dog"\nResult: ${hmacHex}\nExpected: ${expected}\nMatch: ${hmacHex.toLowerCase() === expected}`);
    } catch (error) {
      Alert.alert('Error', `RFC 2202 HMAC-SHA1 test failed: ${(error as Error).message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={{ fontSize: 30, margin: 20, fontWeight: 'bold' }}>Conceal Crypto Test</Text>
        
        <Group name="Input Data">
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Enter text to encrypt"
            multiline
          />
        </Group>

        <Group name="Key (hex)">
          <TextInput
            style={styles.input}
            value={keyText}
            onChangeText={setKeyText}
            placeholder="Enter hex key (64 chars = 32 bytes)"
          />
        </Group>

        <Group name="IV (hex)">
          <TextInput
            style={styles.input}
            value={ivText}
            onChangeText={setIvText}
            placeholder="Enter hex IV (16 chars = 8 bytes)"
          />
        </Group>

        <Group name="Actions">
          <Button title="Test ChaCha8 Encryption" onPress={testChacha8} />
          <View style={styles.buttonSpacer} />
          <Button title="Test Hex Conversion" onPress={testHexConversion} />
          <View style={styles.buttonSpacer} />
          <Button title="Test HMAC-SHA1 (RFC 2202)" onPress={testHmacSha1} />
          <View style={styles.buttonSpacer} />
          <Button title="Test HMAC-SHA1 (Quick Brown Fox)" onPress={testHmacSha1Rfc2202} />
        </Group>

        <Group name="Result">
          <Text style={styles.result}>{result || 'No result yet'}</Text>
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={{ fontSize: 20, marginBottom: 10, fontWeight: '600' }}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
    fontWeight: 'bold',
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: '600',
  },
  group: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  buttonSpacer: {
    height: 10,
  },
  result: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
  },
};
