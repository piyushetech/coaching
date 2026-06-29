import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton, AppInput } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { AuthStackParamList } from '../../navigation/types';
import { authApi } from '../../services/endpoints';
import { saveTokens } from '../../hooks/useAuthInit';
import { connectSocket } from '../../services/socket';
import { store } from '../../store';
import { setAuth } from '../../store/authSlice';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface FormData {
  email: string;
  password: string;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      await saveTokens(res.data.data.accessToken, res.data.data.refreshToken);
      await connectSocket();
      store.dispatch(setAuth({ user: res.data.data.user, profile: res.data.data.profile }));
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>NannyConnect</Text>
        <Text style={styles.subtitle}>Find trusted nannies near you</Text>
      </View>

      <Controller
        control={control}
        name="email"
        rules={{ required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } }}
        render={({ field: { onChange, value } }) => (
          <AppInput label="Email" value={value} onChangeText={onChange} keyboardType="email-address" error={!!errors.email} />
        )}
      />
      <Controller
        control={control}
        name="password"
        rules={{ required: 'Password is required' }}
        render={({ field: { onChange, value } }) => (
          <AppInput label="Password" value={value} onChangeText={onChange} secureTextEntry error={!!errors.password} />
        )}
      />

      <AppButton title="Sign In" onPress={handleSubmit(onSubmit)} loading={loading} />
      <AppButton title="Forgot Password?" onPress={() => navigation.navigate('ForgotPassword')} mode="text" />
      <AppButton title="Create Account" onPress={() => navigation.navigate('Register')} mode="outlined" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, backgroundColor: colors.background, justifyContent: 'center' },
  header: { marginBottom: spacing.xl, alignItems: 'center' },
  title: { color: colors.primary, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, marginTop: spacing.sm },
});
