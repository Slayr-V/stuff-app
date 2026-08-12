import { StyleSheet, Text, View } from 'react-native';

// Temporary placeholder screen for Stage 1 (Project Setup).
// Real navigation (Finds | Boards | + | Search | Profile) and UI
// foundations are built in later stages.
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aisle</Text>
      <Text style={styles.subtitle}>Turn any social post into a shopping list.</Text>
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
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
