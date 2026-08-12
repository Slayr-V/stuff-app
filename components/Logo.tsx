import { Image, type ImageStyle, type StyleProp } from 'react-native';

const LOGO_SOURCE = require('../assets/brand/stuff-logo.jpg');
// Source asset is a square 736x736 wordmark on a white background.
const LOGO_ASPECT_RATIO = 1;

export type LogoProps = {
  height?: number;
  style?: StyleProp<ImageStyle>;
};

export function Logo({ height = 28, style }: LogoProps) {
  return (
    <Image
      source={LOGO_SOURCE}
      style={[{ height, width: height * LOGO_ASPECT_RATIO }, style]}
      resizeMode="contain"
      accessibilityLabel="Stuff"
    />
  );
}
