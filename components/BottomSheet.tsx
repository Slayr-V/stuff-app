import { router } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { theme } from './theme';

export type BottomSheetProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
}>;

// The backdrop + rounded-from-bottom sheet chrome used throughout the
// design (Add to stuff, Save to board, New/Rename Board). Renders as the
// full content of a route presented with `presentation: 'transparentModal'`
// — dismisses on backdrop tap.
export function BottomSheet({ title, subtitle, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFillObject} onPress={() => router.back()} accessibilityLabel="Dismiss" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) + 14 }]}>
        <View style={styles.handle} />
        {title ? <AppText variant="bottomSheetTitle">{title}</AppText> : null}
        {subtitle ? (
          <AppText variant="metadata" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.scrim,
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radii.sheet,
    borderTopRightRadius: theme.radii.sheet,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: theme.radii.full,
    backgroundColor: '#E2E2E2',
    alignSelf: 'center',
    marginBottom: 18,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
  },
  content: {
    gap: 8,
  },
});
