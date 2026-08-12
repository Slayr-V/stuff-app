import { ActivityIndicator, Pressable, type PressableProps, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AppText } from './AppText';
import { theme } from './theme';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'large' | 'small';

export type AppButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  style?: ViewStyle;
};

// Named AppButton (not Button) to avoid any confusion with React Native's
// own bare-bones <Button>, which this replaces everywhere in the app.
//
// "large" (52px, full pill) is the primary/secondary action button from
// the design ("Add your first find", "Save to board", ...). "small" is
// the compact pill used for header actions ("New", "Edit", "Add").
export function AppButton({
  title,
  variant = 'primary',
  size = 'large',
  loading = false,
  disabled,
  style,
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPressIn={() => {
        if (!isDisabled) scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      }}
      {...props}
    >
      <Animated.View
        style={[styles.base, styles[size], styles[variant], isDisabled && styles.disabled, animatedStyle, style]}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? theme.colors.primaryText : theme.colors.ink} />
        ) : (
          <AppText
            variant={size === 'large' ? 'buttonLabel' : 'filterChip'}
            style={variant === 'primary' ? styles.primaryText : styles.defaultText}
          >
            {title}
          </AppText>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.full,
  },
  large: {
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
  },
  small: {
    minHeight: 36,
    paddingVertical: 9,
    paddingHorizontal: 14,
    flexDirection: 'row',
    gap: 6,
  },
  primary: {
    backgroundColor: theme.colors.ink,
  },
  secondary: {
    backgroundColor: theme.colors.tile,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: theme.colors.disabled,
  },
  primaryText: {
    color: theme.colors.primaryText,
  },
  defaultText: {
    color: theme.colors.ink,
  },
});
