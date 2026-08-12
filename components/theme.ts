import { Platform } from 'react-native';

// Design tokens — the single source of truth for color, spacing, radii
// and typography. Components in this folder read from here; screens
// should use the components below rather than reaching into these tokens
// directly, so the whole app's look stays changeable from one place.
//
// This is the monochrome direction from the approved design handoff
// (design_handoff_stuff_app, "stuff App.dc.html" turn 2). Deliberately no
// accent hue anywhere — emphasis comes from weight, size and black fills
// only. Values below are transcribed from that handoff's own token table;
// where the HTML mockup uses a slightly different one-off gray for a
// single element not in that table (there are several — this is a very
// high-fidelity mock with a lot of near-duplicate grays), that value is
// applied locally in the specific component rather than added here, to
// avoid diluting the token set with near-duplicates the design's own
// author didn't consider reusable either.

export const colors = {
  background: '#FFFFFF',
  ink: '#0A0A0A',
  surface: '#F6F6F6', // grouped list rows, stat cards, premium-adjacent panels
  tile: '#F4F4F4', // image tile bg, secondary buttons, search field, filter chips
  hairline: '#ECECEC', // 1px inset separators inside grouped lists
  border: '#E8E8E8', // outlined Discover chips
  dashed: '#DCDCDC', // dashed empty-slot / new-board outlines
  textSecondary: '#8A8A8A',
  textTertiary: '#9A9A9A',
  textQuaternary: '#A5A5A5',
  iconInactive: '#B0B0B0',
  chevron: '#C0C0C0',
  placeholderCaption: '#B3B3B3',
  scrim: 'rgba(10,10,10,0.34)',

  // Not in the design handoff (a pure monochrome mock has no error state)
  // but real error/disabled UI needs *something* — kept separate from the
  // token table above for that reason.
  danger: '#DC2626',
  disabled: '#D8D4CC',

  // Aliases so existing component code (AppButton primary, Fab, etc.)
  // reads as "the app's primary color" without hardcoding "ink" into
  // every call site — still resolves to the same monochrome value.
  primary: '#0A0A0A',
  primaryText: '#FFFFFF',
  text: '#0A0A0A',
  textMuted: '#8A8A8A',
  textInverse: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  // Named per the handoff's own spacing spec, used where the generic
  // scale above doesn't line up with an exact value it calls for.
  gutter: 20, // screen-edge horizontal padding
  gridGutterH: 12,
  gridGutterV: 20,
  cardGap: 9,
  sectionGap: 24, // handoff gives 22-28; 24 splits the difference
  collageGap: 3,
} as const;

export const radii = {
  hero: 24, // full-bleed sheets, hero collection
  sheet: 28, // bottom sheet top corners, floating nav bar
  tile: 18, // product/find cards
  panel: 20, // grouped lists, stat cards, dashed empty-slots, sheet rows
  thumb: 16, // board grid collage
  small: 14, // small thumbs, icon tiles, preview thumbs
  full: 999, // chips, pills, buttons, avatars
  // Back-compat aliases for components not yet ported to the named
  // scale above.
  sm: 14,
  md: 16,
  lg: 20,
} as const;

const monospace = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export const fontFamily = {
  monospace,
} as const;

export const typography = {
  // Large titles
  screenTitle: { fontSize: 32, fontWeight: '700', letterSpacing: -1, color: colors.ink },
  sheetTitle: { fontSize: 27, fontWeight: '700', letterSpacing: -0.8, color: colors.ink },
  emptyTitle: { fontSize: 26, fontWeight: '600', letterSpacing: -0.7, color: colors.ink },
  analysingTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5, color: colors.ink },
  bottomSheetTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5, color: colors.ink },
  featureTitle: { fontSize: 19, fontWeight: '600', letterSpacing: -0.4, color: colors.ink },
  sectionHeading: { fontSize: 17, fontWeight: '700', letterSpacing: -0.4, color: colors.ink },
  navTitle: { fontSize: 16, fontWeight: '600', color: colors.ink },

  // Prices
  priceLarge: { fontSize: 19, fontWeight: '600', color: colors.ink },
  cardPrice: { fontSize: 14, fontWeight: '600', color: colors.ink },

  // Body / rows
  buttonLabel: { fontSize: 15.5, fontWeight: '600' },
  listRow: { fontSize: 15.5, fontWeight: '400', color: colors.ink },
  body: { fontSize: 15, fontWeight: '400', letterSpacing: -0.3, color: colors.ink },
  boardCardTitle: { fontSize: 15, fontWeight: '600', letterSpacing: -0.3, color: colors.ink },
  cardName: { fontSize: 14, fontWeight: '400', color: colors.ink },

  // Secondary / meta
  metadata: { fontSize: 13.5, fontWeight: '400', color: colors.textSecondary },
  filterChip: { fontSize: 13.5, fontWeight: '500', color: colors.ink },
  buildString: { fontSize: 11.5, fontWeight: '400', color: colors.chevron },

  // Uppercase labels
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: colors.textQuaternary, textTransform: 'uppercase' },
  brandLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  collectionEyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 1.6, textTransform: 'uppercase' },
  matchBadge: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.2 },

  // Misc
  placeholderCaption: { fontSize: 9, fontWeight: '400', color: colors.placeholderCaption, fontFamily: monospace },

  // Legacy variant names — kept so components not yet ported to the
  // named scale above (Input, LoadingIndicator captions, error text)
  // still resolve to something sensible from the new palette.
  heading: { fontSize: 30, fontWeight: '700', letterSpacing: -1, color: colors.ink },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5, color: colors.ink },
  label: { fontSize: 15.5, fontWeight: '600', color: colors.ink },
  subtitle: { fontSize: 15, fontWeight: '400', color: colors.textSecondary },
  caption: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
} as const;

export const shadows = {
  navBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 12,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 8,
  },
  toast: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 30,
    elevation: 10,
  },
  floatingButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  saveFlag: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.09,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;

export const theme = { colors, spacing, radii, fontFamily, typography, shadows } as const;

export type Theme = typeof theme;
