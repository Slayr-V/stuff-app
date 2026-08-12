import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Icon } from './Icon';
import { theme } from './theme';

export type FabProps = {
  onPress: () => void;
  style?: ViewStyle;
  accessibilityLabel: string;
};

// 56x56 black circle, white plus, positioned 20 from the right / 112 from
// the bottom (above the floating tab bar) per the design handoff. Present
// on every tab; opens the "Add to stuff" sheet.
export function Fab({ onPress, style, accessibilityLabel }: FabProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      style={[styles.wrapper, style]}
    >
      <Animated.View style={[styles.fab, animatedStyle]}>
        <Icon name="plus" size={20} color={theme.colors.primaryText} strokeWidth={1.9} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.fab,
  },
});
