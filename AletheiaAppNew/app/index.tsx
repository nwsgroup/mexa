import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';

import { router } from 'expo-router';

export default function Login() {

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={require('../assets/images/background-waves.png')}
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>Sync your heart.</Text>
          <Text style={styles.tagline}>Heal your mind</Text>
        </View>

        <View style={styles.formContainer}>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/welcome/welcome')}
          >
            <Text style={styles.buttonText}>LOGIN NOW</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.createAccountButton}>
            <Text style={styles.createAccountText}>CREATE AN ACCOUNT</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // Elimina cualquier padding o margin adicional
    padding: 0,
    margin: 0,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  logoContainer: {
    flex: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 22,
    color: '#333',
    marginBottom: 5,
  },
  formContainer: {
    flex: 3,  // Esto dará proporcionalmente más espacio al formulario
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#F4B942',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createAccountButton: {
    alignItems: 'center',
  },
  createAccountText: {
    color: '#F4B942',
    fontSize: 16,
    fontWeight: '600',
  },
});