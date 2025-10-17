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
