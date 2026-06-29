import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ParentHomeScreen } from '../screens/parent/ParentHomeScreen';
import { NannyDetailScreen } from '../screens/parent/NannyDetailScreen';
import { HiringScreen } from '../screens/parent/HiringScreen';
import { FavoritesScreen } from '../screens/parent/FavoritesScreen';
import { MessagesScreen } from '../screens/shared/MessagesScreen';
import { ChatRoomScreen } from '../screens/shared/ChatRoomScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';
import { ParentTabParamList, ParentStackParamList } from './types';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<ParentTabParamList>();
const Stack = createNativeStackNavigator<ParentStackParamList>();

const ParentTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
          Search: focused ? 'search' : 'search-outline',
          Hiring: focused ? 'briefcase' : 'briefcase-outline',
          Favorites: focused ? 'heart' : 'heart-outline',
          Messages: focused ? 'chatbubbles' : 'chatbubbles-outline',
          Profile: focused ? 'person' : 'person-outline',
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.secondary,
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.primary,
    })}
  >
    <Tab.Screen name="Search" component={ParentHomeScreen} options={{ title: 'Find Nannies' }} />
    <Tab.Screen name="Hiring" component={HiringScreen} options={{ title: 'My Hires' }} />
    <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Saved' }} />
    <Tab.Screen name="Messages" component={MessagesScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export const ParentNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.primary,
    }}
  >
    <Stack.Screen name="Home" component={ParentTabs} options={{ headerShown: false }} />
    <Stack.Screen name="NannyDetail" component={NannyDetailScreen} options={{ title: 'Nanny Profile' }} />
    <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={{ title: 'Chat' }} />
  </Stack.Navigator>
);
