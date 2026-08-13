import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { theme } from './theme';

export type IconName =
  | 'tabFinds'
  | 'tabBoards'
  | 'tabProfile'
  | 'search'
  | 'notification'
  | 'plus'
  | 'chevronRight'
  | 'back'
  | 'share'
  | 'bookmark'
  | 'close'
  | 'checkmark'
  | 'scan'
  | 'link'
  | 'describe'
  | 'appleLogo'
  | 'googleLogo';

export type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

// Exact paths transcribed from the design handoff's inline SVGs — see
// design_handoff_stuff_app/Stuff.dc.html. tabDiscover isn't here: it has
// its own opacity-animated plus glyph and lives in DiscoverTabIcon below.
export function Icon({ name, size = 24, color = theme.colors.ink, strokeWidth }: IconProps) {
  switch (name) {
    case 'tabFinds':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M11.6 2.9l7.6 1 1 7.6-8.5 8.5a1.6 1.6 0 01-2.3 0l-6.3-6.3a1.6 1.6 0 010-2.3z"
            stroke={color}
            strokeWidth={strokeWidth ?? 1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={15.6} cy={8.4} r={1.5} fill={color} />
        </Svg>
      );
    case 'tabBoards':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x={3} y={3.4} width={8} height={10.2} rx={1.7} stroke={color} strokeWidth={strokeWidth ?? 1.6} />
          <Rect x={13} y={3.4} width={8} height={6} rx={1.7} stroke={color} strokeWidth={strokeWidth ?? 1.6} />
          <Rect x={3} y={15.6} width={8} height={5} rx={1.7} stroke={color} strokeWidth={strokeWidth ?? 1.6} />
          <Rect x={13} y={11.4} width={8} height={9.2} rx={1.7} stroke={color} strokeWidth={strokeWidth ?? 1.6} />
        </Svg>
      );
    case 'tabProfile':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={strokeWidth ?? 1.6} />
          <Path
            d="M4.4 20.4c1-4 4-6 7.6-6s6.6 2 7.6 6"
            stroke={color}
            strokeWidth={strokeWidth ?? 1.6}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'search':
      return (
        <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <Circle cx={7} cy={7} r={5} stroke={color} strokeWidth={strokeWidth ?? 1.5} />
          <Line x1={10.7} y1={10.7} x2={14} y2={14} stroke={color} strokeWidth={strokeWidth ?? 1.5} strokeLinecap="round" />
        </Svg>
      );
    case 'notification':
      return (
        <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <Path
            d="M8 2.6a3.9 3.9 0 00-3.9 3.9c0 3.4-1.4 4.4-1.4 4.4h10.6s-1.4-1-1.4-4.4A3.9 3.9 0 008 2.6z"
            stroke={color}
            strokeWidth={strokeWidth ?? 1.5}
          />
          <Path d="M6.7 13.4a1.5 1.5 0 002.6 0" stroke={color} strokeWidth={strokeWidth ?? 1.5} strokeLinecap="round" />
        </Svg>
      );
    case 'plus':
      return (
        <Svg width={size} height={size} viewBox="0 0 20 20">
          <Line x1={10} y1={4} x2={10} y2={16} stroke={color} strokeWidth={strokeWidth ?? 1.6} strokeLinecap="round" />
          <Line x1={4} y1={10} x2={16} y2={10} stroke={color} strokeWidth={strokeWidth ?? 1.6} strokeLinecap="round" />
        </Svg>
      );
    case 'chevronRight':
      return (
        <Svg width={size} height={size} viewBox="0 0 7 12" fill="none">
          <Path d="M1 1l5 5-5 5" stroke={color} strokeWidth={strokeWidth ?? 1.6} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'back':
      return (
        <Svg width={size * 0.6} height={size} viewBox="0 0 7 12" fill="none">
          <Path d="M6 1L1 6l5 5" stroke={color} strokeWidth={strokeWidth ?? 1.7} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'share':
      return (
        <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <Path d="M8 10.5V2.4" stroke={color} strokeWidth={strokeWidth ?? 1.5} strokeLinecap="round" />
          <Path d="M5 5.2L8 2.2l3 3" stroke={color} strokeWidth={strokeWidth ?? 1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Path
            d="M3 9.6v3.2a1 1 0 001 1h8a1 1 0 001-1V9.6"
            stroke={color}
            strokeWidth={strokeWidth ?? 1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'bookmark':
      return (
        <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <Path d="M4 2.2h8v11.6L8 11.1l-4 2.7z" stroke={color} strokeWidth={strokeWidth ?? 1.5} strokeLinejoin="round" />
        </Svg>
      );
    case 'close':
      return (
        <Svg width={size} height={size} viewBox="0 0 12 12">
          <Line x1={2} y1={2} x2={10} y2={10} stroke={color} strokeWidth={strokeWidth ?? 1.7} strokeLinecap="round" />
          <Line x1={10} y1={2} x2={2} y2={10} stroke={color} strokeWidth={strokeWidth ?? 1.7} strokeLinecap="round" />
        </Svg>
      );
    case 'checkmark':
      return (
        <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
          <Path
            d="M2 6.3l2.6 2.6L10 3.5"
            stroke={color}
            strokeWidth={strokeWidth ?? 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'scan':
      return (
        <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <Rect x={1.6} y={4.2} width={12.8} height={9.6} rx={2.4} stroke={color} strokeWidth={strokeWidth ?? 1.4} />
          <Circle cx={8} cy={9} r={2.7} stroke={color} strokeWidth={strokeWidth ?? 1.4} />
          <Path d="M5.8 4.2l.9-1.8h2.6l.9 1.8" stroke={color} strokeWidth={strokeWidth ?? 1.4} />
        </Svg>
      );
    case 'link':
      return (
        <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <Path
            d="M6.6 9.4a2.8 2.8 0 004.2.3l2-2a2.8 2.8 0 00-4-4l-1 1"
            stroke={color}
            strokeWidth={strokeWidth ?? 1.5}
            strokeLinecap="round"
          />
          <Path
            d="M9.4 6.6a2.8 2.8 0 00-4.2-.3l-2 2a2.8 2.8 0 004 4l1-1"
            stroke={color}
            strokeWidth={strokeWidth ?? 1.5}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'describe':
      return (
        <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <Path
            d="M2.2 4.4a2 2 0 012-2h7.6a2 2 0 012 2v5a2 2 0 01-2 2H6.4L3 14V4.4z"
            stroke={color}
            strokeWidth={strokeWidth ?? 1.5}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'appleLogo':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            fill={color}
            d="M17.05 12.54c.02-2.3 1.87-3.4 1.95-3.45-1.06-1.56-2.72-1.77-3.3-1.8-1.4-.11-2.73.82-3.44.82-.72 0-1.81-.8-2.98-.78-1.53.02-2.94.89-3.73 2.26-1.59 2.76-.41 6.85 1.14 9.1.76 1.1 1.67 2.33 2.86 2.29 1.15-.05 1.58-.74 2.96-.74 1.37 0 1.77.74 2.97.72 1.23-.02 2.02-1.12 2.78-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.63M14.86 5.4c.62-.76 1.04-1.8.92-2.85-.9.04-2 .6-2.65 1.35-.58.67-1.08 1.74-.95 2.76 1 .08 2.03-.51 2.68-1.26"
          />
        </Svg>
      );
    case 'googleLogo':
      // Kept monochrome (opacity tiers of the same ink color) rather than
      // Google's brand colors, matching the design's pure black/white
      // system — the same 4-path "G" shape, no color swatches added.
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            fill={color}
            opacity={0.9}
            d="M21.6 12.2c0-.7-.06-1.36-.18-2H12v3.8h5.38a4.6 4.6 0 01-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.32z"
          />
          <Path
            fill={color}
            opacity={0.7}
            d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.23-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.75-5.59-4.1H3.06v2.6A9.99 9.99 0 0012 22z"
          />
          <Path
            fill={color}
            opacity={0.5}
            d="M6.41 13.93a6 6 0 010-3.85V7.48H3.06a10 10 0 000 9.04l3.35-2.59z"
          />
          <Path
            fill={color}
            opacity={0.8}
            d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.86-2.86A9.9 9.9 0 0012 2 9.99 9.99 0 003.06 7.48l3.35 2.6C7.2 7.73 9.4 5.98 12 5.98z"
          />
        </Svg>
      );
  }
}

// The Discover tab's magnifier grows a plus sign inside the lens when
// active (opacity 0 -> 1) rather than swapping icon or color scheme —
// matches the handoff exactly rather than approximating with two
// separate icons.
export function DiscoverTabIcon({ size = 25, color = theme.colors.ink, strokeWidth = 1.6, active = false }: {
  size?: number;
  color?: string;
  strokeWidth?: number;
  active?: boolean;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={10.6} cy={10.6} r={7.2} stroke={color} strokeWidth={strokeWidth} />
      <Line x1={15.9} y1={15.9} x2={20.8} y2={20.8} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M10.6 6.4v8.4M6.4 10.6h8.4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity={active ? 1 : 0} />
    </Svg>
  );
}
