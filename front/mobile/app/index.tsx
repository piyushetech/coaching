import { Redirect, router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/lib/auth';

export default function WelcomeScreen() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(app)/(tabs)/videos" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Sankalp Classes</Text>
      <Text style={styles.tagline}>Sign in with mobile OTP · Videos, PDFs & exams</Text>

      <Pressable style={[styles.portalBtn, styles.studentBtn]} onPress={() => router.push('/login/student')}>
        <Text style={styles.portalTitle}>Student Portal</Text>
        <Text style={styles.portalSub}>Watch videos and read documents</Text>
      </Pressable>

      <Pressable style={[styles.portalBtn, styles.adminBtn]} onPress={() => router.push('/login/admin')}>
        <Text style={styles.portalTitle}>Admin Portal</Text>
        <Text style={styles.portalSub}>Staff login · head admin sees storage</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f8fafc' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 32, fontWeight: '900', color: '#4f46e5', marginBottom: 8 },
  tagline: { fontSize: 15, color: '#64748b', marginBottom: 32 },
  portalBtn: { borderRadius: 16, padding: 20, marginBottom: 14 },
  studentBtn: { backgroundColor: '#4f46e5' },
  adminBtn: { backgroundColor: '#0f766e' },
  portalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  portalSub: { color: 'rgba(255,255,255,0.85)', marginTop: 6, fontSize: 13 }
});
