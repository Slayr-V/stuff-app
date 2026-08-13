import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoadingIndicator } from '@/components';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ImportDraftProvider } from '@/hooks/useImportDraft';
import { ToastProvider } from '@/hooks/useToast';

// Root layout for the whole app: the tab navigator plus every screen that
// lives above it — Import's own sheet flow, Product Detail, Board Detail
// — gated behind a real session by RootNavigator below.
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <ToastProvider>
            <ImportDraftProvider>
              <RootNavigator />
            </ImportDraftProvider>
          </ToastProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

// Gates the whole app behind a real session: signed-out users only ever
// see app/onboarding (the quiz + sign up/log in flow); every other route
// is unreachable until a session exists. Stack.Protected re-evaluates
// its guard on every session change, so a successful sign-up/sign-in
// inside onboarding automatically swaps the visible stack over to
// (tabs) — and signing out from Profile sends the user straight back to
// onboarding — with no manual router.replace() calls needed anywhere.
function RootNavigator() {
  const { session, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <LoadingIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
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
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="onboarding/index" />
      </Stack.Protected>
    </Stack>
  );
}
