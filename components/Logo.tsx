import { Image, View, type ViewStyle } from 'react-native';

const LOGO_SOURCE = require('../assets/brand/stuff-logo.jpg');

// The source asset is a square 736x736 JPEG with generous white margin
// around the wordmark (not tightly cropped) — naively scaling it into a
// small header slot would show mostly empty space around tiny text. The
// design handoff crops it the same way: a fixed small clipping window
// with the image scaled up and offset inside it, zoomed into just the
// wordmark. Ratios below are transcribed from that handoff (window
// 75x22, image width 147, offset -36/-62) and scaled proportionally to
// whatever height is requested here.
// TODO: replace with a proper transparent SVG/PNG wordmark export —
// noted in the design handoff too, not just here.
const BASE_WINDOW_HEIGHT = 22;
const BASE_WINDOW_WIDTH = 75;
const BASE_IMAGE_WIDTH = 147;
const BASE_OFFSET_LEFT = -36;
const BASE_OFFSET_TOP = -62;

export type LogoProps = {
  height?: number;
  style?: ViewStyle;
};

export function Logo({ height = 22, style }: LogoProps) {
  const scale = height / BASE_WINDOW_HEIGHT;
  const windowWidth = BASE_WINDOW_WIDTH * scale;
  const imageWidth = BASE_IMAGE_WIDTH * scale;

  return (
    <View style={[{ width: windowWidth, height, overflow: 'hidden' }, style]} accessibilityLabel="Stuff">
      <Image
        source={LOGO_SOURCE}
        style={{
          position: 'absolute',
          left: BASE_OFFSET_LEFT * scale,
          top: BASE_OFFSET_TOP * scale,
          width: imageWidth,
          height: imageWidth,
        }}
        resizeMode="contain"
      />
    </View>
  );
}
