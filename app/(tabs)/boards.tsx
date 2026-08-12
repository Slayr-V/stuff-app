import { StyleSheet, Text, View } from 'react-native';

// Placeholder Boards screen. Real Board creation/management and the
// system "All Saved" collection are built in the Core Aisle Library stage.
export default function BoardsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>No Boards yet</Text>
      <Text style={styles.subtitle}>Create a Board to organise your saved products.</Text>
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
