import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider } from '@/lib/auth';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login/student" options={{ headerShown: true, title: 'Student Login' }} />
          <Stack.Screen name="login/admin" options={{ headerShown: true, title: 'Admin Login' }} />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="exam/[id]" options={{ headerShown: true, title: 'Mock Exam' }} />
          <Stack.Screen name="video/[id]" options={{ presentation: 'modal', headerShown: true, title: 'Video' }} />
          <Stack.Screen name="pdf/[id]" options={{ presentation: 'modal', headerShown: true, title: 'Document' }} />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
