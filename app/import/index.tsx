import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText, BottomSheet, Icon, type IconName, theme } from '@/components';

type Row = {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
};

// "Add to stuff" — the entry sheet for every import path, opened from the
// FAB and the Finds empty state. Only two of the four rows the design
// specifies are wired to something real: this app has no share-sheet
// extension and no camera/object-recognition pipeline, so "Share from an
// app" and "Scan something" say so honestly (a real, informative tap
// response) rather than silently doing nothing — a silent no-op here is
// exactly the bug that prompted this whole redesign. The two real paths
// both land on the same Describe screen, because the actual capability
// behind either row is identical: caption text plus an optional link,
// sent to analyze-find.
export default function AddToStuffScreen() {
  const rows: Row[] = [
    {
      icon: 'share',
      title: 'Share from an app',
      subtitle: 'Instagram, TikTok, anywhere',
      onPress: () =>
        Alert.alert(
          'Not built yet',
          "Sharing straight from another app needs a share-sheet extension, which isn't built yet. For now, paste a link or describe what you found.",
        ),
    },
    {
      icon: 'scan',
      title: 'Scan something',
      subtitle: 'Point at a real object',
      onPress: () =>
        Alert.alert(
          'Not built yet',
          "Pointing your camera at an object needs a recognition pipeline, which isn't built yet. For now, describe what you're looking for.",
        ),
    },
    {
      icon: 'link',
      title: 'Paste a link or screenshot',
      subtitle: 'Any post, page or image',
      onPress: () => {
        router.back();
        router.push('/import/describe?mode=paste');
      },
    },
    {
      icon: 'describe',
      title: 'Describe it',
      subtitle: '"the ribbed cream vase from that reel"',
      onPress: () => {
        router.back();
        router.push('/import/describe?mode=describe');
      },
    },
  ];

  return (
    <BottomSheet title="Add to stuff" subtitle="stuff reads the content and finds the products in it.">
      {rows.map((row) => (
        <Pressable key={row.title} style={styles.row} onPress={row.onPress}>
          <View style={styles.iconTile}>
            <Icon name={row.icon} size={18} color={theme.colors.primaryText} strokeWidth={1.6} />
          </View>
          <View style={styles.rowText}>
            <AppText variant="label">{row.title}</AppText>
            <AppText variant="metadata">{row.subtitle}</AppText>
          </View>
        </Pressable>
      ))}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 12,
    borderRadius: theme.radii.panel,
    backgroundColor: theme.colors.surface,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.small,
    backgroundColor: theme.colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
});
