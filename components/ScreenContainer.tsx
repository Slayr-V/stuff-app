import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from './theme';

export type ScreenContainerProps = PropsWithChildren<{
  scroll?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}>;

// Standard screen wrapper: safe-area aware, consistent background and
// padding. Use this instead of a raw View at the root of a screen.
//
// Only bottom/left/right edges are safe-area-inset — every current screen
// sits under a navigator header, which already accounts for the top
// inset. A screen presented without a header would need `edges` exposed
// here to include 'top'.
export function ScreenContainer({ children, scroll = false, style, contentContainerStyle }: ScreenContainerProps) {
  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={['bottom', 'left', 'right']}>
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, contentContainerStyle]}>{children}</ScrollView>
      ) : (
        <View style={[styles.content, styles.flex, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  flex: {
    flex: 1,
  },
});
