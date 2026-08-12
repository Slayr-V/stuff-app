import { StyleSheet } from 'react-native';

import { AppText, ScreenContainer } from '@/components';

// Placeholder Search screen. Real library search (product, brand,
// category, Board, creator, source platform) is built in the Search stage.
export default function SearchScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.center}>
      <AppText variant="title">Search</AppText>
      <AppText variant="subtitle" style={styles.subtitle}>
        Search your saved products, brands and Boards.
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
