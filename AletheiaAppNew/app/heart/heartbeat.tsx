import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// Types
type AudioStatus = {
  didJustFinish?: boolean;
  isPlaying?: boolean;
};

// Constants
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const CIRCLE_LENGTH = 1000;
const R = CIRCLE_LENGTH / (2 * Math.PI);
const ANIMATION_DURATION = 10000;

export default function HeartbeatScreen() {
  // Animation and progress states
  const progress = useSharedValue(0);
  const [isRunning, setIsRunning] = useState(false);
  const [percentage, setPercentage] = useState(0);

  // Modal and audio states
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<ArrayBuffer | null>(null);

  // Cleanup effect for sound
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Audio playback functions
  const playHeartbeat = async (mp3Data: ArrayBuffer) => {
    try {
      console.log('Starting playHeartbeat function');

      if (sound) {
        console.log('Unloading previous sound');
        await sound.unloadAsync();
      }

      // Crear archivo temporal
      const tempUri = `${FileSystem.documentDirectory}temp_${Date.now()}.mp3`;
      console.log('Temp file URI:', tempUri);

      // Escribir el archivo directamente sin convertir a base64
      await FileSystem.writeAsStringAsync(tempUri, mp3Data.toString(), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log('File written successfully');

      // Verificar si el archivo existe
      const fileInfo = await FileSystem.getInfoAsync(tempUri);
      console.log('File exists:', fileInfo.exists, 'File size:', fileInfo.size);

      // Cargar y reproducir el sonido
      console.log('Creating sound object');
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: tempUri },
        { shouldPlay: true }
      );

      console.log('Sound created successfully');

      setSound(newSound);
      setIsPlaying(true);

      // Configurar el listener de estado
      newSound.setOnPlaybackStatusUpdate((status) => {
        console.log('Playback status:', status);
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      // Limpiar archivo temporal
      setTimeout(async () => {
        try {
          await FileSystem.deleteAsync(tempUri);
          console.log('Temp file deleted');
        } catch (error) {
          console.error('Error deleting temp file:', error);
        }
      }, 2000);

    } catch (error) {
      console.error('Error in playHeartbeat:', error);
      setIsPlaying(false);
    }
  };

  const stopSound = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      } catch (error) {
        console.error('Error stopping sound:', error);
      }
    }
  };

  const generateAndPlayHeartbeat = async () => {
    setIsLoading(true);
    try {
      console.log('Initiating API request...');

      const response = await fetch('http://192.168.1.61:8000/api/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bpm: 20
        })
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const mp3Data = await response.arrayBuffer();
      console.log('Received ArrayBuffer size:', mp3Data.byteLength);

      // Primero mostrar el modal
      setModalVisible(true);
      console.log('Modal set to visible');

      // Esperar un momento para asegurar que el modal esté visible
      setTimeout(async () => {
        console.log('Starting audio playback');
        await playHeartbeat(mp3Data);
      }, 500);

    } catch (error) {
      console.error('Error in generateAndPlayHeartbeat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Progress animation functions
  const updateIsRunning = useCallback((value: boolean) => {
    setIsRunning(value);
  }, []);

  const startMeasurement = () => {
    if (isRunning) return;

    // Reset values
    progress.value = 0;
    setPercentage(0);
    updateIsRunning(true);
    runOnJS(generateAndPlayHeartbeat)();

    // Start animation and audio generation
    progress.value = withTiming(1, {
      duration: ANIMATION_DURATION,
      easing: Easing.linear,
    }, (finished) => {
      if (finished) {
        console.log("Animation finished");
      }
    });

    // Update percentage
    let startTime = Date.now();
    const updateInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const currentProgress = Math.min((elapsedTime / ANIMATION_DURATION) * 100, 100);
      setPercentage(Math.round(currentProgress));

      if (elapsedTime >= ANIMATION_DURATION) {
        clearInterval(updateInterval);
      }
    }, 1000);
  };


  useEffect(() => {
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
        console.log('Audio mode set successfully');
      } catch (error) {
        console.error('Error setting audio mode:', error);
      }
    };

    initAudio();
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCLE_LENGTH * (1 - progress.value),
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Icons */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="home" size={24} color="#F4B942" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="microphone" size={24} color="#F4B942" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="cog" size={24} color="#F4B942" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Listening to your{'\n'}heartbeat...</Text>

        <View style={styles.progressContainer}>
          <Svg style={styles.svg} width={R * 2} height={R * 2}>
            <Circle
              cx={R}
              cy={R}
              r={R - 30}
              stroke="#E0E0E0"
              strokeWidth="2"
              fill="none"
            />
            <G rotation="-90" origin={`${R}, ${R}`}>
              <AnimatedCircle
                cx={R}
                cy={R}
                r={R - 30}
                stroke="#F4B942"
                strokeWidth="4"
                strokeDasharray={CIRCLE_LENGTH}
                animatedProps={animatedProps}
                strokeLinecap="round"
                fill="none"
              />
            </G>
            <Circle
              cx={R}
              cy={R}
              r={40}
              fill="#F4B942"
            />
          </Svg>
          <View style={styles.centerIcon}>
            <MaterialCommunityIcons name="heart-pulse" size={40} color="white" />
          </View>
          <Text style={styles.percentage}>{percentage}%</Text>
        </View>

        <Text style={styles.subtitle}>Together we will find{'\n'}balance.</Text>

        <TouchableOpacity
          style={[styles.startButton, isRunning && styles.startButtonDisabled]}
          onPress={startMeasurement}
          disabled={isRunning}
        >
          <Text style={styles.startButtonText}>
            {isRunning ? 'Measuring...' : 'Start'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.brandText}>ALETHEIA</Text>
      </View>

      {/* Audio Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          stopSound();
          setModalVisible(false);
        }}
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  stopSound();
                  setModalVisible(false);
                }}
              >
                <MaterialCommunityIcons name="close" size={24} color="#F4B942" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>Your Heartbeat</Text>

            <View style={styles.heartbeatVisualizer}>
              {isLoading ? (
                <ActivityIndicator size="large" color="#F4B942" />
              ) : (
                <MaterialCommunityIcons
                  name="heart-pulse"
                  size={50}
                  color="#F4B942"
                  style={[styles.pulsingIcon, isPlaying && styles.pulsing]}
                />
              )}
            </View>

            {!isLoading && (
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => {
                  if (isPlaying) {
                    stopSound();
                  } else if (audioData) {
                    playHeartbeat(audioData);
                  }
                }}
              >
                <MaterialCommunityIcons
                  name={isPlaying ? "pause-circle" : "play-circle"}
                  size={50}
                  color="#F4B942"
                />
              </TouchableOpacity>
            )}

            <Text style={styles.modalText}>
              {isLoading ? "Generating your heartbeat..." :
                isPlaying ? "Playing your heartbeat..." :
                  "Press play to listen"}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <MaterialCommunityIcons name="chart-timeline-variant" size={24} color="#F4B942" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <MaterialCommunityIcons name="microphone" size={24} color="#F4B942" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <MaterialCommunityIcons name="chart-box" size={24} color="#F4B942" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: '#F4B942',
    textAlign: 'center',
    marginBottom: 40,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  svg: {
    transform: [{ rotate: '90deg' }],
  },
  centerIcon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    position: 'absolute',
    bottom: -40,
    fontSize: 24,
    color: '#F4B942',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#88B04B',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 30,
  },
  startButtonDisabled: {
    backgroundColor: '#88B04B80',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  brandText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navButton: {
    padding: 8,
    backgroundColor: '#FFF',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F4B942',
    textAlign: 'center',
    marginBottom: 20,
  },
  heartbeatVisualizer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    marginBottom: 20,
  },
  pulsingIcon: {
    opacity: 1,
  },
  pulsing: {
    opacity: 0.7,
  },
  playButton: {
    alignSelf: 'center',
    padding: 10,
    zIndex: 1,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
  }
});