import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { theme } from './theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, number> = { sm: 16, md: 20, lg: 28 };

export type IconProps = {
  name: IoniconName;
  size?: Size | number;
  // ColorValue (not just string) so this can be used directly as a
  // react-navigation tabBarIcon, which hands back a platform ColorValue.
  color?: ColorValue;
};

// Thin wrapper around the underlying icon set so the rest of the app
// depends on this component, not on @expo/vector-icons directly — the
// icon library can change later without touching every screen.
export function Icon({ name, size = 'md', color = theme.colors.text }: IconProps) {
  const resolvedSize = typeof size === 'number' ? size : SIZES[size];
  return <Ionicons name={name} size={resolvedSize} color={color} />;
}
