import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useState } from "react";
import { Image } from 'react-native';
import { StyleSheet, Text, View, Button } from 'react-native';
import { TextInput } from 'react-native';
import { Configuration, OpenAIApi } from "openai";
import 'react-native-url-polyfill/auto';




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
      //res.status(200).json({ result: completion.data.choices[0].text });
      //setResult(data.result);
      console.log(completion.data)
      setResult(completion.data)
    } catch (error) {
      // Consider adjusting the error handling logic for your use case
      if (error.response) {
        console.error(error.response.status, error.response.data);
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
      }
    }
    setLoading(false);
  }


  function generatePrompt(animal) {
    const capitalizedAnimal =
      animal[0].toUpperCase() + animal.slice(1).toLowerCase();
    return `Suggest three names for an animal that is a superhero.

      Animal: Cat
      Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
      Animal: Dog
      Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
      Animal: ${capitalizedAnimal}
      Names:`;
  }


  return (
    <View style={styles.container}>
      <Text>Create a pet</Text>
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

      {loading ? ( // conditionally render loading text or loading bar
        <Text style={styles.tooComplicated}>Loading...</Text>
      ) : (
      <View style={styles.tooComplicated}>
        {result && result.data && result.data.length > 0 && (
          <Image source={{ uri: result.data[0].url }} style={{ width: 200, height: 200 }} />
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
  }
});
