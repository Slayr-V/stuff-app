import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { theme } from './theme';

export type SpinnerProps = {
  size?: number;
  borderWidth?: number;
  trackColor?: string;
  activeColor?: string;
};

// The ring spinner from the design (pending-import banner thumb,
// "Matching products" analysing step) — a real rotating animation via
// Reanimated, not a static ring.
export function Spinner({ size = 18, borderWidth = 2, trackColor = '#E2E2E2', activeColor = theme.colors.ink }: SpinnerProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor: trackColor,
          borderTopColor: activeColor,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {},
});
