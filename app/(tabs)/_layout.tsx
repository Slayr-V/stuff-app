import { BlurView } from 'expo-blur';
import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiscoverTabIcon, Fab, Icon, theme } from '@/components';

// Floating pill tab bar (icons only, no labels) + a floating "+" action
// for Import — per the design handoff, not a 5th tab. See components/Fab
// and the README for why Import specifically is a FAB, not a tab item.
export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: theme.colors.ink,
          tabBarInactiveTintColor: theme.colors.iconInactive,
          tabBarStyle: {
            position: 'absolute',
            left: 14,
            right: 14,
            bottom: insets.bottom + 28,
            height: 66,
            borderRadius: theme.radii.sheet,
            borderTopWidth: 0,
            backgroundColor: 'transparent',
            ...theme.shadows.navBar,
          },
          tabBarBackground: () => <BlurView intensity={50} tint="light" style={styles.blur} />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarAccessibilityLabel: 'Finds',
            tabBarIcon: ({ color, focused }) => (
              <Icon name="tabFinds" size={25} color={color} strokeWidth={focused ? 2.1 : 1.6} />
            ),
          }}
        />
        <Tabs.Screen
          name="boards"
          options={{
            tabBarAccessibilityLabel: 'Boards',
            tabBarIcon: ({ color, focused }) => (
              <Icon name="tabBoards" size={25} color={color} strokeWidth={focused ? 2.1 : 1.6} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            tabBarAccessibilityLabel: 'Discover',
            tabBarIcon: ({ color, focused }) => (
              <DiscoverTabIcon size={25} color={color} strokeWidth={focused ? 2.1 : 1.6} active={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarAccessibilityLabel: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Icon name="tabProfile" size={25} color={color} strokeWidth={focused ? 2.1 : 1.6} />
            ),
          }}
        />
      </Tabs>
      <Fab
        accessibilityLabel="Add to stuff"
        onPress={() => router.push('/import')}
        style={{ right: 20, bottom: insets.bottom + 112 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blur: {
    flex: 1,
    borderRadius: theme.radii.sheet,
    overflow: 'hidden',
  },
});
