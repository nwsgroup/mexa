import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const CIRCLE_LENGTH = 1000;
const R = CIRCLE_LENGTH / (2 * Math.PI);
const ANIMATION_DURATION = 10000; // 45 segundos

export default function HeartbeatScreen() {
    const progress = useSharedValue(0);
    const [isRunning, setIsRunning] = useState(false);
    const [percentage, setPercentage] = useState(0);
  
    // Función para actualizar el estado de isRunning
    const updateIsRunning = useCallback((value : any) => {
      setIsRunning(value);
    }, []);
  
    const startMeasurement = () => {
      if (isRunning) return;
      
      // Reiniciar valores
      progress.value = 0;
      setPercentage(0);
      updateIsRunning(true);
  
      // Iniciar la animación con runOnJS para el callback
      progress.value = withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.linear,
      }, (finished) => {
        if (finished) {
          runOnJS(updateIsRunning)(false);
        }
      });
  
      // Actualizar el porcentaje cada segundo
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
          style={[
            styles.startButton,
            isRunning && styles.startButtonDisabled
          ]}
          onPress={startMeasurement}
          disabled={isRunning}
        >
          <Text style={styles.startButtonText}>
            {isRunning ? 'Measuring...' : 'Start'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.brandText}>ALETHEIA</Text>
      </View>

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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
    marginTop: 38,
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
});