import { StyleSheet, Text, type TextProps } from 'react-native';

import { theme } from './theme';

type Variant = keyof typeof theme.typography;

export type AppTextProps = TextProps & {
  variant?: Variant;
};

// The one Text component screens should use. Keeps typography (size,
// weight, color) consistent and gives the app a single place to change
// the type scale later instead of every screen's inline styles.
export function AppText({ variant = 'body', style, ...props }: AppTextProps) {
  return <Text style={[styles[variant], style]} {...props} />;
}

const styles = StyleSheet.create(theme.typography);
