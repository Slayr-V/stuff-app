import { View, type ViewStyle, type ViewProps } from 'react-native';

import { theme } from './theme';

export type CardProps = ViewProps & {
  backgroundColor?: string;
  radius?: number;
};

// Flat surface container — grouped list panel, stat card, sheet row.
// Per the design: "Cards have no borders — separation comes from the
// grey tile fill against white." No default shadow either; specific
// elements that do float above content (nav bar, FAB, toast, save-flag
// chips) use theme.shadows explicitly where they're built.
export function Card({ style, backgroundColor = theme.colors.surface, radius = theme.radii.thumb, ...props }: CardProps) {
  const base: ViewStyle = { backgroundColor, borderRadius: radius, padding: theme.spacing.md };
  return <View style={[base, style]} {...props} />;
}
