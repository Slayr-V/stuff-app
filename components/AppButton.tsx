import { ActivityIndicator, Pressable, type PressableProps, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AppText } from './AppText';
import { theme } from './theme';

type Variant = 'primary' | 'secondary' | 'ghost';

export type AppButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  style?: ViewStyle;
};

// Named AppButton (not Button) to avoid any confusion with React Native's
// own bare-bones <Button>, which this replaces everywhere in the app.
export function AppButton({ title, variant = 'primary', loading = false, disabled, style, ...props }: AppButtonProps) {
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
      <Animated.View style={[styles.base, styles[variant], isDisabled && styles.disabled, animatedStyle, style]}>
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? theme.colors.primaryText : theme.colors.primary} />
        ) : (
          <AppText variant="label" style={variant === 'primary' ? styles.primaryText : styles.defaultText}>
            {title}
          </AppText>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.md,
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.lg,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    color: theme.colors.text,
  },
});
