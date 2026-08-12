import { StyleSheet } from 'react-native';

import { AppText, ScreenContainer } from '@/components';

// Placeholder Profile screen. Real authentication, account state and
// preferences (country, currency, preferred retailers) are built in the
// Authentication and User Preferences stages.
export default function ProfileScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.center}>
      <AppText variant="title">Profile</AppText>
      <AppText variant="subtitle" style={styles.subtitle}>
        Account and preferences will appear here once you&apos;re signed in.
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
