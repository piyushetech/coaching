import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../hooks/redux';
import { LoadingScreen } from '../components/ui';
import { AuthNavigator } from './AuthNavigator';
import { ParentNavigator } from './ParentNavigator';
import { NannyNavigator } from './NannyNavigator';
import { RootStackParamList } from './types';
import { useAuthInit } from '../hooks/useAuthInit';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  useAuthInit();
  const { isAuthenticated, isLoading, user } = useAppSelector((s) => s.auth);

  if (isLoading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user?.role === 'nanny' ? (
          <Stack.Screen name="NannyMain" component={NannyNavigator} />
        ) : (
          <Stack.Screen name="ParentMain" component={ParentNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
