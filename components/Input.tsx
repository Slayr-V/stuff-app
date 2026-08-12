import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { AppText } from './AppText';
import { theme } from './theme';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

// No border, per the design's "cards have no borders" philosophy — a
// filled tile instead, matching its search-field treatment.
export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label ? <AppText variant="eyebrow">{label}</AppText> : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={theme.colors.textTertiary}
        {...props}
      />
      {error ? (
        <AppText variant="caption" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  input: {
    minHeight: 44,
    borderRadius: theme.radii.small,
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.ink,
    backgroundColor: theme.colors.tile,
  },
  inputError: {
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  error: {
    color: theme.colors.danger,
  },
});
