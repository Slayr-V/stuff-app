// Design tokens — the single source of truth for color, spacing, radii
// and typography. Components in this folder read from here; screens
// should use the components below rather than reaching into these tokens
// directly, so the whole app's look stays changeable from one place.
//
// Palette/type direction follows the reference UI the app is modeled on
// (ReciMe): warm neutrals + a single blue accent for interactive
// elements, a serif display face for headings against a plain sans body.
//
// No dark mode / multi-theme support yet — not needed until a stage
// actually asks for it — but every value below is a named token rather
// than a hardcoded literal in a screen, so adding one later doesn't mean
// rewriting every screen.

export const colors = {
  background: '#FFFFFF',
  surface: '#F7F5F2',
  surfaceAlt: '#F2ECDD', // warm cream, for feature/empty-state cards
  border: '#E8E4DD',
  text: '#1C1B19',
  textMuted: '#767268',
  textInverse: '#FFFFFF',
  primary: '#3B7DED',
  primaryText: '#FFFFFF',
  accent: '#3B7DED',
  danger: '#DC2626',
  disabled: '#D8D4CC',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 22,
  full: 999,
} as const;

// Registered in app/_layout.tsx via useFonts — these string keys must
// match exactly. AppText/screens fall back to the system font until
// fonts finish loading (see fontsLoaded gating in the root layout).
export const fontFamily = {
  display: 'PlayfairDisplay-Bold',
  displayMedium: 'PlayfairDisplay-SemiBold',
} as const;

export const typography = {
  heading: { fontSize: 30, fontFamily: fontFamily.display, color: colors.text },
  title: { fontSize: 22, fontFamily: fontFamily.displayMedium, color: colors.text },
  body: { fontSize: 15, fontWeight: '400', color: colors.text },
  label: { fontSize: 15, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 15, fontWeight: '400', color: colors.textMuted },
  caption: { fontSize: 13, fontWeight: '400', color: colors.textMuted },
} as const;

export const theme = { colors, spacing, radii, fontFamily, typography } as const;

export type Theme = typeof theme;
