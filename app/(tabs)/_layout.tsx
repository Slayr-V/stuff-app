import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';

import { APP_NAME } from '@/constants/app';

// Primary navigation: Finds | Boards | + | Search | Profile.
//
// The "+" tab is an action, not a screen — see its `listeners` below.
export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: APP_NAME,
          tabBarLabel: 'Finds',
          tabBarIcon: ({ color, size }) => <Ionicons name="albums-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="boards"
        options={{
          title: 'Boards',
          tabBarIcon: ({ color, size }) => <Ionicons name="bookmark-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="import"
        options={{
          title: 'Import',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size + 10} color={color} />,
        }}
        listeners={{
          tabPress: (event) => {
            // This tab never navigates to its own screen. Intercept the
            // press and present the real import flow (app/import.tsx) as a
            // modal over the tabs instead.
            event.preventDefault();
            router.push('/import');
          },
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
