import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { NannyRequestsScreen } from '../screens/nanny/NannyRequestsScreen';
import { NannyProfileEditScreen } from '../screens/nanny/NannyProfileEditScreen';
import { HiringScreen } from '../screens/parent/HiringScreen';
import { MessagesScreen } from '../screens/shared/MessagesScreen';
import { ChatRoomScreen } from '../screens/shared/ChatRoomScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { NannyTabParamList, NannyStackParamList } from './types';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<NannyTabParamList>();
const Stack = createNativeStackNavigator<NannyStackParamList>();

const NannyTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
          Requests: focused ? 'mail' : 'mail-outline',
          Jobs: focused ? 'briefcase' : 'briefcase-outline',
          Messages: focused ? 'chatbubbles' : 'chatbubbles-outline',
          Profile: focused ? 'person' : 'person-outline',
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.secondary,
    })}
  >
    <Tab.Screen name="Requests" component={NannyRequestsScreen} options={{ title: 'Requests' }} />
    <Tab.Screen name="Jobs" component={HiringScreen} options={{ title: 'My Jobs' }} />
    <Tab.Screen name="Messages" component={MessagesScreen} />
    <Tab.Screen name="Profile" component={NannyProfileEditScreen} options={{ title: 'My Profile' }} />
  </Tab.Navigator>
);

export const NannyNavigator = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.primary }}>
    <Stack.Screen name="Requests" component={NannyTabs} options={{ headerShown: false }} />
    <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={{ title: 'Chat' }} />
  </Stack.Navigator>
);
