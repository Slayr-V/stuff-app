import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Icon, type IconProps } from './Icon';
import { theme } from './theme';

export type FabProps = {
  icon?: IconProps['name'];
  onPress: () => void;
  style?: ViewStyle;
  accessibilityLabel: string;
};

// Floating action button — the primary "create/import" action, styled and
// animated like the reference UI's FAB rather than living inside the tab
// bar (see app/(tabs)/_layout.tsx for why: tab-bar-item interception was
// both a design mismatch and a reliability problem).
export function Fab({ icon = 'add', onPress, style, accessibilityLabel }: FabProps) {
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
        <Icon name={icon} size={28} color={theme.colors.primaryText} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});
