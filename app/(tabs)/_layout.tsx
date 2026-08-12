import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fab, Icon, Logo, theme } from '@/components';

// Primary navigation: Finds | Boards | Search | Profile, plus a floating
// "+" action for Import (not a tab item — see Fab below).
//
// Import used to be a 5th tab whose press was intercepted
// (listeners.tabPress + preventDefault) to open a modal instead of
// actually navigating to its own screen. That was both a design mismatch
// with the reference UI (which uses a real floating action button) and a
// reliability problem — a real FAB with its own onPress is strictly
// simpler and doesn't depend on canceling the tab navigator's default
// behavior working correctly on every platform/version.
export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerTitleAlign: 'left',
          tabBarActiveTintColor: theme.colors.accent,
          tabBarInactiveTintColor: theme.colors.textMuted,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerTitle: () => <Logo height={24} style={styles.headerLogo} />,
            tabBarLabel: 'Finds',
            tabBarIcon: ({ color, size }) => <Icon name="albums-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="boards"
          options={{
            title: 'Boards',
            tabBarIcon: ({ color, size }) => <Icon name="bookmark-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => <Icon name="search-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <Icon name="person-outline" size={size} color={color} />,
          }}
        />
      </Tabs>
      <Fab
        accessibilityLabel="Import a Find"
        onPress={() => router.push('/import')}
        style={{ right: theme.spacing.lg, bottom: insets.bottom + 78 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerLogo: {
    marginLeft: theme.spacing.md,
  },
});
