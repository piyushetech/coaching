import { useEffect } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OtpLoginForm } from '@/components/OtpLoginForm';
import { useAuth } from '@/lib/auth';

export default function AdminLoginScreen() {
  const { signInWithOtp, requestOtp, user } = useAuth();

  useEffect(() => {
    if (user) router.replace('/(app)/(tabs)/videos');
  }, [user]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <OtpLoginForm
        title="Admin Portal"
        subtitle="Sign in with your registered mobile number"
        accent="#0f766e"
        hint="Head admin test mobile: 7619548975 (after backend restart)."
        onSendOtp={requestOtp}
        onVerifyOtp={(mobile, otp) => signInWithOtp('admin', mobile, otp)}
      />
    </SafeAreaView>
  );
}
