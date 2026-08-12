// Design tokens — the single source of truth for color, spacing, radii
// and typography. Components in this folder read from here; screens
// should use the components below rather than reaching into these tokens
// directly, so the whole app's look stays changeable from one place.
//
// No dark mode / multi-theme support yet — not needed until a stage
// actually asks for it — but every value below is a named token rather
// than a hardcoded literal in a screen, so adding one later doesn't mean
// rewriting every screen.

export const colors = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  border: '#E5E7EB',
  text: '#111827',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',
  primary: '#111827',
  primaryText: '#FFFFFF',
  danger: '#DC2626',
  disabled: '#D1D5DB',
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
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
} as const;

export const typography = {
  heading: { fontSize: 28, fontWeight: '700', color: colors.text },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, fontWeight: '400', color: colors.text },
  label: { fontSize: 15, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 15, fontWeight: '400', color: colors.textMuted },
  caption: { fontSize: 13, fontWeight: '400', color: colors.textMuted },
} as const;

export const theme = { colors, spacing, radii, typography } as const;

export type Theme = typeof theme;
