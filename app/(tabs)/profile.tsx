import { StyleSheet, Text, View } from 'react-native';

// Placeholder Profile screen. Real authentication, account state and
// preferences (country, currency, preferred retailers) are built in the
// Authentication and User Preferences stages.
export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Account and preferences will appear here once you&apos;re signed in.</Text>
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
