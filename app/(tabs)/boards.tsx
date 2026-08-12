import { StyleSheet } from 'react-native';

import { AppText, ScreenContainer } from '@/components';

// Placeholder Boards screen. Real Board creation/management and the
// system "All Saved" collection are built in the Core Aisle Library stage.
export default function BoardsScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.center}>
      <AppText variant="title">No Boards yet</AppText>
      <AppText variant="subtitle" style={styles.subtitle}>
        Create a Board to organise your saved products.
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
