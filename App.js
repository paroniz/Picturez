import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useState } from "react";
import { Image, Linking } from 'react-native';
import { StyleSheet, Text, View, Button } from 'react-native';
import { TextInput } from 'react-native';
import { Configuration, OpenAIApi } from "openai";
import 'react-native-url-polyfill/auto';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [animalInput, setAnimalInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const configuration = new Configuration({
    apiKey: "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",
  });
  const openai = new OpenAIApi(configuration);
  const input = `${animalInput}`;

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const completion = await openai.createImage({
        prompt: input,
        n: 1,
        size: "1024x1024",
      });
      setResult(completion.data)
    } catch (error) {
      if (error.response) {
        console.error(error.response.status, error.response.data);
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
      }
    }
    setLoading(false);
  }

  function downloadImage() {
    Linking.openURL(result.data[0].url);
  }

  async function onDownload() {
    if (!result.data || result.data.length === 0) {
      return;
    }

    const fileUri = result.data[0].url;
    const fileExtension = fileUri.substr(fileUri.lastIndexOf('.') + 1);
    const localUri = `${FileSystem.documentDirectory}generated-image.${fileExtension}`;
    const downloadsUri = FileSystem.downloadDirectory + `generated-image.${fileExtension}`;

    try {
      const downloadObject = FileSystem.createDownloadResumable(
        fileUri,
        localUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${progress}`);
        }
      );

      const result = await downloadObject.downloadAsync();
      if (result.status === 200) {
        const asset = await MediaLibrary.createAssetAsync(result.uri);
        await MediaLibrary.createAlbumAsync('Download', asset, false);
        console.log('Download complete');
      } else {
        console.log(`Download failed: HTTP status code ${result.status}`);
      }
    } catch (error) {
      console.error(error);
    }

  }

  return (
    <View style={styles.container}>
      <Text>Magical picture generator</Text>
      <View>
        <TextInput
          style={styles.textInput}
          name="animal"
          placeholder="Enter an animal"
          value={animalInput}
          onChangeText={text => setAnimalInput(text)}
        />
        <Button onPress={onSubmit} title="Generate picture" />
      </View>

      {loading ? (
        <Text style={styles.tooComplicated}>Loading...</Text>
      ) : (
        <View style={styles.tooComplicated}>
          {result && result.data && result.data.length > 0 && (
            <>
              <Image source={{ uri: result.data[0].url }} style={{ width: 200, height: 200 }} />
              <Button style={styles.tooComplicated2} onPress={onDownload} title="Download image" />
              <Button style={styles.tooComplicated2} onPress={downloadImage} title="Open in browser" />
            </>
          )}
          {/* <StatusBar style="auto" /> */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 10,
  },
  tooComplicated: {
    paddingTop: 20
  },
  tooComplicated2: {
    paddingTop: 20
  }
});
