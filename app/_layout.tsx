// Imported from their individual weight submodules (not the package
// barrel) so Metro only bundles the two weights actually used, not all
// twelve. See @expo-google-fonts/playfair-display's own subpath exports.
import { PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display/600SemiBold';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display/700Bold';
import { useFonts } from '@expo-google-fonts/playfair-display/useFonts';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/hooks/useAuth';

// Keep the native splash screen up until fonts are ready — avoids a
// flash of system-font text before the display face swaps in.
SplashScreen.preventAutoHideAsync();

// Root layout for the whole app: the tab navigator plus any screens that
// live above it (currently just the Import modal, opened from the "+" tab).
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
    'PlayfairDisplay-SemiBold': PlayfairDisplay_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="import"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Import',
              }}
            />
            <Stack.Screen
              name="boards/new"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'New Board',
              }}
            />
            <Stack.Screen
              name="boards/[id]/index"
              options={{
                headerShown: true,
                title: 'Board',
              }}
            />
            <Stack.Screen
              name="boards/[id]/rename"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Rename Board',
              }}
            />
            <Stack.Screen
              name="finds/[id]/index"
              options={{
                headerShown: true,
                title: 'Find',
              }}
            />
          </Stack>
        </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
