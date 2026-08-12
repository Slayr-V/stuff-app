import { StyleSheet, View, type ViewProps } from 'react-native';

import { theme } from './theme';

export type CardProps = ViewProps & {
  variant?: 'surface' | 'feature';
};

// Generic surface container — a Board tile, a product result, a settings
// row. "feature" is the warm cream card used for empty states / highlight
// moments (see the reference UI's empty-state card); "surface" (default)
// is the plain neutral card used everywhere else.
export function Card({ style, variant = 'surface', ...props }: CardProps) {
  return <View style={[styles.card, variant === 'feature' ? styles.feature : styles.surface, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  surface: {
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  feature: {
    backgroundColor: theme.colors.surfaceAlt,
  },
});
