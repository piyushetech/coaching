import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getStoredUser, getToken } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function AppLayout() {
  const { user, loading } = useAuth();
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      setSessionOk(true);
      return;
    }
    if (!loading) {
      Promise.all([getToken(), getStoredUser()]).then(([token, stored]) => {
        setSessionOk(Boolean(token && stored));
      });
    }
  }, [user, loading]);

  if (loading || sessionOk === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!user && !sessionOk) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
