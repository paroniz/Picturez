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
//import ImagePicker from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';

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

      const fileUri = completion.data.data[0].url;
      const fileExtension = fileUri.substr(fileUri.lastIndexOf('.') + 1);
      const localUri = `${FileSystem.documentDirectory}generated-image.${fileExtension}`;

      const downloadObject = FileSystem.createDownloadResumable(
        fileUri,
        localUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${progress}`);
        }
      );

      const downloadResult = await downloadObject.downloadAsync();
      if (downloadResult.status === 200) {
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        await MediaLibrary.createAlbumAsync('Picturez', asset, false);
        console.log('Download complete');
        await deleteFile(localUri); 
        console.log('Delete complete')
      } else {
        console.log(`Download failed: HTTP status code ${downloadResult.status}`);
      }
    } catch (error) {
      if (error.response) {
        console.error(error.response.status, error.response.data);
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
      }
    }

    setLoading(false);
  }


  //WORKING
  // async function onSubmitWithAutoMoveToPictures(event) {
  //   event.preventDefault();
  //   setLoading(true);
  //   try {
  //     const completion = await openai.createImage({
  //       prompt: input,
  //       n: 1,
  //       size: "1024x1024",
  //     });
  //     const fileUri = completion.data.data[0].url;
  //     const fileExtension = fileUri.substr(fileUri.lastIndexOf('.') + 1);
  //     const localUri = `${FileSystem.documentDirectory}generated-image.${fileExtension}`;
  //     const downloadsUri = FileSystem.downloadDirectory + `generated-image.${fileExtension}`;
  //     const downloadObject = FileSystem.createDownloadResumable(
  //       fileUri,
  //       localUri,
  //       {},
  //       (downloadProgress) => {
  //         const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
  //         console.log(`Download progress: ${progress}`);
  //       }
  //     );
  //     const result = await downloadObject.downloadAsync();
  //     if (result.status === 200) {
  //       const asset = await MediaLibrary.createAssetAsync(result.uri);
  //       await MediaLibrary.createAlbumAsync('Picturez', asset, false);
  //       console.log('Download complete');
  //     } else {
  //       console.log(`Download failed: HTTP status code ${result.status}`);
  //     }
  //     setResult(completion.data);
  //   } catch (error) {
  //     if (error.response) {
  //       console.error(error.response.status, error.response.data);
  //     } else {
  //       console.error(`Error with OpenAI API request: ${error.message}`);
  //     }
  //   }
  //   setLoading(false);
  // }

  // async function onSubmit2(event, imageData = null) {
  //   setLoading(true);
  //   try {
  //     const prompt = imageData
  //       ? `Create an image of a ${animalInput}.\n\n${imageData}`
  //       : `Create an image of a ${animalInput}.`;

  //       console.log(prompt)
  //     const completion = await openai.createImage({
  //       prompt,
  //       n: 1,
  //       size: "1024x1024",
  //       //image: image,
  //     });
  //     setResult(completion.data);
  //   } catch (error) {
  //     if (error.response) {
  //       console.error(error.response.status, error.response.data);
  //     } else {
  //       console.error(`Error with OpenAI API request: ${error.message}`);
  //     }
  //   }
  //   setLoading(false);
  // }

  function openInBrowser() {
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
        await MediaLibrary.createAlbumAsync('Picturez', asset, false);
        console.log('Download complete');
        await deleteFile(localUri); 
      } else {
        console.log(`Download failed: HTTP status code ${result.status}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteFile(localUri) {
    try {
      await FileSystem.deleteAsync(localUri);
      console.log('File deleted successfully');
    } catch (error) {
      console.log(`Error deleting file: ${error}`);
    }
  }


  // async function pickImage() {
  //   try {
  //     const result = await DocumentPicker.pick({
  //       type: [DocumentPicker.types.images],
  //       copyToCacheDirectory: false,
  //       multiple: false, // if you only want to select one image
  //       destination: DocumentPicker.directoryCache
  //     });

  //     const imageUri = result[0].uri;

  //     // Read the file data from the image URI
  //     //const imageData = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
  //     const response = await fetch(imageUri);
  //     const blob = await response.blob();

  //     // Use a FileReader to read the file as a data URL
  //     const reader = new FileReader();
  //     reader.readAsDataURL(blob);

  //     // Wait for the reader to finish reading the file
  //     const imageData = await new Promise((resolve, reject) => {
  //       reader.onload = () => resolve(reader.result);
  //       reader.onerror = reject;
  //     });

  //     // Extract the base64-encoded data from the data URL
  //     const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');

  //     onSubmit2(null, base64Data);
  //   } catch (err) {
  //     if (DocumentPicker.isCancel(err)) {
  //       console.log('User cancelled image picker');
  //     } else {
  //       console.log('DocumentPicker Error: ', err);
  //     }
  //   }
  // }

  return (
    <View style={styles.container}>
      <Text style={styles.tooComplicated2}>Picturez</Text>
      <Text style={styles.tooComplicated}>Magical picture generator</Text>
      <View>
        <TextInput
          style={styles.textInput}
          name="animal"
          placeholder="Enter magic"
          value={animalInput}
          onChangeText={text => setAnimalInput(text)}
        />
        <Button onPress={onSubmit} title="Generate picture" />
        {/* <Button onPress={pickImage} title="Select image" /> */}
      </View>

      {loading ? (
        <Text style={styles.tooComplicated}>Loading...</Text>
      ) : (
        <View style={styles.tooComplicated}>
          {result && result.data && result.data.length > 0 && (
            <>
              <Image source={{ uri: result.data[0].url }} style={{ width: 200, height: 200 }} />
              <Button style={styles.tooComplicated2} onPress={onDownload} title="Save to media folder" />
              <Button style={styles.tooComplicated2} onPress={openInBrowser} title="Open in browser" />
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
    marginTop: 20
  },
  tooComplicated2: {
    fontSize: 24,
    fontWeight: 'bold'
  }
});
