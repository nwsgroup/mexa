import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CONTAINER_SIZE = Math.min(Dimensions.get('window').width * 0.8, 300);

export default function FluidWaves() {
  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);

  React.useEffect(() => {
    // Configuración de animación más suave
    const animationConfig = {
      duration: 2000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    };

    // Primera ola
    wave1.value = withRepeat(
      withSequence(
        withTiming(1, animationConfig),
        withTiming(0, animationConfig)
      ),
      -1,
      true
    );

    // Segunda ola con un timing ligeramente diferente
    wave2.value = withRepeat(
      withSequence(
        withTiming(1, { ...animationConfig, duration: 2500 }),
        withTiming(0, { ...animationConfig, duration: 2500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedProps1 = useAnimatedProps(() => ({
    d: `M 25 50 
       C ${40 + wave1.value * 5} ${45 + wave1.value * 10} 
         ${60 - wave1.value * 5} ${55 - wave1.value * 10} 
         75 50`,
  }));

  const animatedProps2 = useAnimatedProps(() => ({
    d: `M 20 50 
       C ${35 - wave2.value * 5} ${45 - wave2.value * 8} 
         ${65 + wave2.value * 5} ${55 + wave2.value * 8} 
         80 50`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.circleContainer}>
        <Svg height="100%" width="100%" viewBox="0 0 100 100">
          {/* Círculo exterior (borde negro) */}
          <Circle cx="50" cy="50" r="45" fill="none" stroke="#000" strokeWidth="1.5"/>
          
          {/* Círculo interior (borde dorado) */}
          <Circle cx="50" cy="50" r="43" fill="none" stroke="#F4B942" strokeWidth="0.5"/>
          
          <G>
            <AnimatedPath
              animatedProps={animatedProps1}
              stroke="#F4B942"
              strokeWidth="2"
              fill="none"
              opacity="0.8"
            />
            <AnimatedPath
              animatedProps={animatedProps2}
              stroke="#F4B942"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
          </G>
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
});