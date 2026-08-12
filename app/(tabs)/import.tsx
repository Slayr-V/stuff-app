// This file exists only so the "+" tab has a route to attach to inside the
// Tabs navigator (Expo Router's tabs are file-based). Pressing that tab is
// always intercepted in app/(tabs)/_layout.tsx and redirected to the real
// import flow at app/import.tsx, presented as a modal. This screen itself
// should never render.
export default function ImportTabPlaceholder() {
  return null;
}
