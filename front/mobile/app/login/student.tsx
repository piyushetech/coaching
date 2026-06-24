import { useEffect } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OtpLoginForm } from '@/components/OtpLoginForm';
import { useAuth } from '@/lib/auth';

export default function StudentLoginScreen() {
  const { signInWithOtp, requestOtp, user } = useAuth();

  useEffect(() => {
    if (user) router.replace('/(app)/(tabs)/videos');
  }, [user]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <OtpLoginForm
        title="Student Portal"
        subtitle="Sign in with your registered mobile number"
        accent="#4f46e5"
        hint="Your mobile must be saved in your student profile by the admin."
        onSendOtp={requestOtp}
        onVerifyOtp={(mobile, otp) => signInWithOtp('student', mobile, otp)}
      />
    </SafeAreaView>
  );
}
