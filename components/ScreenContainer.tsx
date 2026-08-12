import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { theme } from './theme';

export type ScreenContainerProps = PropsWithChildren<{
  scroll?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  edges?: Edge[];
  backgroundColor?: string;
  padded?: boolean;
}>;

// Standard screen wrapper: safe-area aware, consistent background.
//
// `edges` defaults to all four — most screens (the 4 tabs, sheets, forms)
// have no native header now (they build their own in-content header) so
// they need the top inset too. Screens that go edge-to-edge under the
// status bar (Product Detail, Board Detail — the image header extends
// behind it, with a manually-positioned back button) should pass
// `edges={['bottom', 'left', 'right']}` or `[]` and handle top spacing
// themselves with useSafeAreaInsets().
export function ScreenContainer({
  children,
  scroll = false,
  style,
  contentContainerStyle,
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor = theme.colors.background,
  padded = true,
}: ScreenContainerProps) {
  const contentStyle = padded ? styles.content : undefined;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }, style]} edges={edges}>
      {scroll ? (
        <ScrollView contentContainerStyle={[contentStyle, contentContainerStyle]}>{children}</ScrollView>
      ) : (
        <View style={[contentStyle, styles.flex, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.gutter,
  },
  flex: {
    flex: 1,
  },
});
