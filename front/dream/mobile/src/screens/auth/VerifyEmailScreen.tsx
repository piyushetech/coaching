import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton, AppInput } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { AuthStackParamList } from '../../navigation/types';
import { authApi, parentApi, nannyApi } from '../../services/endpoints';
import { store } from '../../store';
import { setAuth } from '../../store/authSlice';
import { connectSocket } from '../../services/socket';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

export const VerifyEmailScreen: React.FC<Props> = ({ route }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await authApi.verifyEmail({ email, otp });
      const profileRes =
        (await parentApi.getProfile().catch(() => null)) ||
        (await nannyApi.getProfile().catch(() => null));
      if (profileRes?.data?.data) {
        const profile = profileRes.data.data;
        store.dispatch(setAuth({ user: profile.user, profile }));
        await connectSocket().catch(() => undefined);
      }
      Alert.alert('Success', 'Email verified successfully!');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Verification failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.resendOTP(email);
      Alert.alert('Sent', 'OTP logged in backend terminal (development mode)');
    } catch {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Verify Email</Text>
      <Text style={styles.subtitle}>Enter the 6-digit OTP sent to {email}</Text>
      <AppInput label="OTP" value={otp} onChangeText={setOtp} keyboardType="numeric" />
      <AppButton title="Verify" onPress={handleVerify} loading={loading} />
      <AppButton title="Resend OTP" onPress={handleResend} mode="text" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background, justifyContent: 'center' },
  title: { color: colors.primary, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: colors.textSecondary, textAlign: 'center', marginVertical: spacing.lg },
});
