import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/hooks/useAuth';
import { ImportDraftProvider } from '@/hooks/useImportDraft';
import { ToastProvider } from '@/hooks/useToast';

// Root layout for the whole app: the tab navigator plus every screen that
// lives above it — Import's own sheet flow, Product Detail, Board Detail.
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <ToastProvider>
            <ImportDraftProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="import/index" options={{ presentation: 'transparentModal', animation: 'fade' }} />
                <Stack.Screen name="import/describe" options={{ presentation: 'modal' }} />
                <Stack.Screen name="import/analyzing" options={{ presentation: 'modal', gestureEnabled: false }} />
                <Stack.Screen name="import/results" options={{ presentation: 'modal' }} />
                <Stack.Screen name="board-picker" options={{ presentation: 'transparentModal', animation: 'fade' }} />
                <Stack.Screen name="products/[id]" options={{ presentation: 'modal' }} />
                <Stack.Screen name="boards/new" options={{ presentation: 'transparentModal', animation: 'fade' }} />
                <Stack.Screen name="boards/[id]/index" options={{ presentation: 'modal' }} />
                <Stack.Screen name="boards/[id]/rename" options={{ presentation: 'transparentModal', animation: 'fade' }} />
                <Stack.Screen name="finds/[id]/index" options={{ presentation: 'modal' }} />
              </Stack>
            </ImportDraftProvider>
          </ToastProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
