import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  onStudentLogin: () => void;
  onAdminLogin: () => void;
};

export function WelcomeScreen({ onStudentLogin, onAdminLogin }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>S</Text>
        </View>
        <Text style={styles.brand}>Sankalp Coaching</Text>
        <Text style={styles.tagline}>Videos, PDFs & study material</Text>

        <Pressable style={[styles.portalBtn, styles.studentBtn]} onPress={onStudentLogin}>
          <Text style={styles.portalTitle}>Student Login</Text>
          <Text style={styles.portalSub}>Watch videos and read PDFs</Text>
        </Pressable>

        <Pressable style={[styles.portalBtn, styles.adminBtn]} onPress={onAdminLogin}>
          <Text style={styles.portalTitle}>Admin Login</Text>
          <Text style={styles.portalSub}>Manage student mobile access</Text>
        </Pressable>

        <Text style={styles.hint}>Demo OTP for both portals: 123456</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eef2ff' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20
  },
  logoText: { color: '#fff', fontSize: 40, fontWeight: '900' },
  brand: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e1b4b',
    textAlign: 'center',
    marginBottom: 8
  },
  tagline: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32
  },
  portalBtn: { borderRadius: 16, padding: 20, marginBottom: 14 },
  studentBtn: { backgroundColor: '#4f46e5' },
  adminBtn: { backgroundColor: '#0f766e' },
  portalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  portalSub: { color: 'rgba(255,255,255,0.85)', marginTop: 6, fontSize: 13 },
  hint: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 13,
    color: '#94a3b8'
  }
});
