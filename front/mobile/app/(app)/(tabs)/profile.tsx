import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { isOwnerUser } from '@/lib/api';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  async function logout() {
    await signOut();
    router.replace('/');
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.role}>
        {user && isOwnerUser(user) ? 'Head Admin' : user?.role === 'admin' ? 'Admin' : 'Student'}
      </Text>
      {user?.courses?.length ? (
        <Text style={styles.courses}>Courses: {user.courses.join(', ').toUpperCase()}</Text>
      ) : null}
      <Pressable style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, backgroundColor: '#f8fafc' },
  name: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  email: { fontSize: 15, color: '#64748b', marginTop: 6 },
  role: { marginTop: 12, fontSize: 14, fontWeight: '700', color: '#4f46e5' },
  courses: { marginTop: 8, fontSize: 13, color: '#475569' },
  logoutBtn: {
    marginTop: 32,
    backgroundColor: '#fee2e2',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  logoutText: { color: '#b91c1c', fontWeight: '800' }
});
