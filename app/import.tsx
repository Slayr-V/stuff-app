import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// The manual import flow, presented as a modal over the tabs when the "+"
// tab is pressed. Real import methods (paste URL, screenshot, video
// upload, screen recording, pasted text) are built in the Import System
// stage — this is deliberately just the entry point + a way to dismiss it.
export default function ImportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import a Find</Text>
      <Text style={styles.subtitle}>Paste a link, upload a screenshot, or share content from another app.</Text>
      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeButtonText}>Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 16,
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
  closeButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
