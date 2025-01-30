import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

export default function AudioRecorderScreen() {
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [isRecording, setIsRecording] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    if (permissionResponse?.status !== 'granted') {
      requestPermission();
    }
  }, []);

  async function startRecording() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    try {
      if (!recording) {
        return;
      }

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.getURI();
      await uploadAudio(uri);
      
      setRecording(undefined);
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  }

  const saveAudioEntry = async (uri: string, transcription: string, classification:string, irrational_ideas:any = {}) => {
    try {
      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        transcription,
        uri,
        classification,
        irrational_ideas
      };
  
      const existingEntries = await AsyncStorage.getItem('audioEntries');
      const entries = existingEntries ? JSON.parse(existingEntries) : [];
      entries.unshift(newEntry);
  
      await AsyncStorage.setItem('audioEntries', JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving audio entry:', error);
    }
  };

  async function uploadAudio(uri: string) {
    try {
      const formData = new FormData();
      
      const audioFile = {
        uri: uri,
        type: 'audio/m4a',
        name: 'audio_recording.m4a'
      } as const;
      
      formData.append('file', audioFile as any);

      const response = await fetch('http://192.168.1.61:8000/api/v1/audio', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Error uploading audio');
      }

      const result = await response.json();
      console.log('Audio uploaded successfully:', result);  
      await saveAudioEntry(uri, result.analysis.transcript, result.analysis.classification, result.analysis.irrational_ideas);
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tell me how you feel right now</Text>
      <Text style={styles.subtitle}>I'm here to listen to you</Text>
      
      <View style={styles.waveContainer}>
        {/* Aquí puedes agregar una imagen o componente de onda */}
        <Image 
          source={require('../../assets/images/golden-waves.png')} 
          style={styles.waveImage}
        />
      </View>

      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recordingButton]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>
          {isRecording ? 'Stop' : 'Rec'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>ALETHEIA</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFB347', 
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  waveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  waveImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50', // Color verde para el botón Rec
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordingButton: {
    backgroundColor: '#f44336', // Color rojo para el botón Stop
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
  },
  footerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFB347',
  }
});