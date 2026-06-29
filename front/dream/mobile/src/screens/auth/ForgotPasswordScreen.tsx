import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton, AppInput } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { AuthStackParamList } from '../../navigation/types';
import { authApi } from '../../services/endpoints';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep('reset');
      Alert.alert('Sent', 'OTP sent to your email');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      Alert.alert('Success', 'Password reset successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Reset Password</Text>
      {step === 'email' ? (
        <>
          <AppInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <AppButton title="Send OTP" onPress={sendOTP} loading={loading} />
        </>
      ) : (
        <>
          <AppInput label="OTP" value={otp} onChangeText={setOtp} keyboardType="numeric" />
          <AppInput label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
          <AppButton title="Reset Password" onPress={resetPassword} loading={loading} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background, justifyContent: 'center' },
  title: { color: colors.primary, fontWeight: '700', marginBottom: spacing.lg, textAlign: 'center' },
});
