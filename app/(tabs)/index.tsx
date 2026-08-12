import { StyleSheet, Text, View } from 'react-native';

import { APP_NAME } from '@/constants/app';

// Placeholder Finds screen. Real Finds (imported content, identified
// products, confidence, retailer links) are built in the Core Aisle
// Library and Import System / Product Identification stages.
export default function FindsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>No Finds yet</Text>
      <Text style={styles.subtitle}>
        Share a post from Instagram, TikTok, YouTube or the web to {APP_NAME}, or tap the + button below to import
        one manually.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 8,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
});
