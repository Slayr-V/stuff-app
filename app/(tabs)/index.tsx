import { StyleSheet } from 'react-native';

import { AppText, ScreenContainer } from '@/components';
import { APP_NAME } from '@/constants/app';

// Placeholder Finds screen. Real Finds (imported content, identified
// products, confidence, retailer links) are built in the Core Stuff
// Library and Import System / Product Identification stages.
export default function FindsScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.center}>
      <AppText variant="title">No Finds yet</AppText>
      <AppText variant="subtitle" style={styles.subtitle}>
        Share a post from Instagram, TikTok, YouTube or the web to {APP_NAME}, or tap the + button below to import
        one manually.
      </AppText>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
});
