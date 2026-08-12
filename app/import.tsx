import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppButton, AppText, ScreenContainer } from '@/components';

// The manual import flow, presented as a modal over the tabs when the "+"
// tab is pressed. Real import methods (paste URL, screenshot, video
// upload, screen recording, pasted text) are built in the Import System
// stage — this is deliberately just the entry point + a way to dismiss it.
export default function ImportScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.center}>
      <AppText variant="title">Import a Find</AppText>
      <AppText variant="subtitle" style={styles.subtitle}>
        Paste a link, upload a screenshot, or share content from another app.
      </AppText>
      <AppButton title="Close" onPress={() => router.back()} style={styles.closeButton} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  subtitle: {
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 8,
  },
});
