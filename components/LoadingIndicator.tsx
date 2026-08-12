import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { theme } from './theme';

export type LoadingIndicatorProps = {
  label?: string;
  size?: 'small' | 'large';
};

export function LoadingIndicator({ label, size = 'small' }: LoadingIndicatorProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {label ? (
        <AppText variant="caption" style={styles.label}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
  },
  label: {
    color: theme.colors.textMuted,
  },
});
