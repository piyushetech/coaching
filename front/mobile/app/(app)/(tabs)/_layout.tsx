import { Tabs } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function TabLayout() {
  const { isAdmin } = useAuth();

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#4f46e5', headerShown: true }}>
      <Tabs.Screen name="videos" options={{ title: 'Videos', tabBarLabel: 'Videos' }} />
      <Tabs.Screen name="documents" options={{ title: 'Documents', tabBarLabel: 'PDFs' }} />
      <Tabs.Screen name="mock-exam" options={{ title: 'Mock Exam', tabBarLabel: 'Exams' }} />
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Admin', tabBarLabel: 'Admin', href: isAdmin ? undefined : null }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarLabel: 'Profile' }} />
    </Tabs>
  );
}
