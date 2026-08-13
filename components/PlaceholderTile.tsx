import { useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

import { AppText } from './AppText';
import { theme } from './theme';

let patternIdCounter = 0;

export type PlaceholderTileProps = {
  caption?: string;
  captionPosition?: 'bottom-left' | 'top-left';
  radius?: number;
  backgroundColor?: string;
  // Dark stripe on a light tile by default. The onboarding welcome
  // screen's hero panels sit on a near-black background, where that
  // stripe would be invisible — pass a light rgba there instead.
  stripeColor?: string;
  style?: StyleProp<ViewStyle>;
};

// Every product shot, board cover, brand avatar and editorial image in
// the design is a placeholder — a diagonally-striped tile with a small
// monospace caption naming what belongs there. This is that placeholder,
// not a design choice to skip: real imagery comes from
// products.image_url / finds.thumbnail_url once those are populated
// (Product Search / Import stages), and every call site should swap to a
// real <Image> at that point rather than keep using this.
export function PlaceholderTile({
  caption,
  captionPosition = 'bottom-left',
  radius = theme.radii.tile,
  backgroundColor = theme.colors.tile,
  stripeColor = 'rgba(10,10,10,0.035)',
  style,
}: PlaceholderTileProps) {
  const idRef = useRef<string | null>(null);
  if (idRef.current === null) {
    patternIdCounter += 1;
    idRef.current = `placeholder-stripes-${patternIdCounter}`;
  }
  const id = idRef.current;

  return (
    <View style={[styles.container, { borderRadius: radius, backgroundColor }, style]}>
      <Svg style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Defs>
          <Pattern id={id} patternUnits="userSpaceOnUse" width={13} height={13} patternTransform="rotate(135)">
            <Rect width={13} height={13} fill={backgroundColor} />
            <Rect width={6} height={13} fill={stripeColor} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      {caption ? (
        <AppText
          variant="placeholderCaption"
          style={captionPosition === 'top-left' ? styles.captionTop : styles.captionBottom}
        >
          {caption}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  captionBottom: {
    position: 'absolute',
    left: 9,
    bottom: 9,
  },
  captionTop: {
    position: 'absolute',
    left: 12,
    top: 12,
  },
});
