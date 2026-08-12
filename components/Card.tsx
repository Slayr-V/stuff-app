import { StyleSheet, View, type ViewProps } from 'react-native';

import { theme } from './theme';

export type CardProps = ViewProps;

// Generic surface container — a Board tile, a product result, a settings
// row. No feature-specific layout of its own.
export function Card({ style, ...props }: CardProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
});
