import { StyleSheet, View } from 'react-native';

import { PlaceholderTile } from './PlaceholderTile';
import { theme } from './theme';

export type BoardCollageProps = {
  height: number;
  radius?: number;
};

// The 3-panel board-cover collage used at three sizes: pinned board
// (216), grid board (128), Board Detail header (264). One large left
// panel + two stacked right panels, 3px gaps, no borders.
export function BoardCollage({ height, radius = theme.radii.thumb }: BoardCollageProps) {
  return (
    <View style={[styles.row, { height, borderRadius: radius }]}>
      <PlaceholderTile caption="cover" radius={0} style={styles.left} backgroundColor="#F2F2F2" />
      <View style={styles.right}>
        <PlaceholderTile radius={0} style={styles.flex} backgroundColor="#F4F4F4" />
        <PlaceholderTile radius={0} style={styles.flex} backgroundColor="#EFEFEF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: theme.spacing.collageGap,
    overflow: 'hidden',
  },
  left: {
    flex: 2,
  },
  right: {
    flex: 1,
    gap: theme.spacing.collageGap,
  },
  flex: {
    flex: 1,
  },
});
