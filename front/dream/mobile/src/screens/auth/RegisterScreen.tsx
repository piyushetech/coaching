import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, SegmentedButtons, Banner } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton, AppInput } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { AuthStackParamList } from '../../navigation/types';
import { authApi } from '../../services/endpoints';
import { saveTokens } from '../../hooks/useAuthInit';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  city: string;
  budget: string;
  experienceYears: string;
  aboutMe: string;
}

const defaultValues: FormData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  address: '',
  city: '',
  budget: '',
  experienceYears: '',
  aboutMe: '',
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'parent' | 'nanny'>('parent');
  const [serverError, setServerError] = useState('');
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ defaultValues });

  const handleRoleChange = (value: string) => {
    setRole(value as 'parent' | 'nanny');
    reset(defaultValues);
    setServerError('');
  };

  const onSubmit = async (data: FormData) => {
    setServerError('');
    if (data.password !== data.confirmPassword) {
      setServerError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: data.email.trim(),
        password: data.password,
        role,
        fullName: data.fullName.trim(),
        phone: data.phone.trim() || undefined,
        address: data.address.trim() || undefined,
        city: data.city.trim() || undefined,
        ...(role === 'parent'
          ? { budget: data.budget.trim() || undefined }
          : {
              experienceYears: data.experienceYears.trim() || undefined,
              aboutMe: data.aboutMe.trim() || undefined,
            }),
      };

      const res = await authApi.register(payload);
      await saveTokens(res.data.data.accessToken, res.data.data.refreshToken);
      setServerError('');
      navigation.navigate('VerifyEmail', { email: data.email.trim() });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string; code?: string };
      const message =
        axiosErr.response?.data?.message ||
        (axiosErr.code === 'ERR_NETWORK' ? 'Cannot reach server. Is the backend running on port 5000?' : null) ||
        axiosErr.message ||
        'Registration failed';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text variant="headlineMedium" style={styles.title}>Create Account</Text>

      {serverError ? (
        <Banner visible icon="alert-circle" style={styles.banner}>
          {serverError}
        </Banner>
      ) : null}

      <SegmentedButtons
        value={role}
        onValueChange={handleRoleChange}
        buttons={[
          { value: 'parent', label: 'Parent' },
          { value: 'nanny', label: 'Nanny' },
        ]}
        style={styles.segment}
      />

      <Controller control={control} name="fullName" rules={{ required: 'Full name is required' }}
        render={({ field: { onChange, value } }) => (
          <AppInput label="Full Name" value={value} onChangeText={onChange} error={!!errors.fullName} errorText={errors.fullName?.message} />
        )}
      />
      <Controller control={control} name="email" rules={{
        required: 'Email is required',
        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
      }}
        render={({ field: { onChange, value } }) => (
          <AppInput label="Email" value={value} onChangeText={onChange} keyboardType="email-address" error={!!errors.email} errorText={errors.email?.message} />
        )}
      />
      <Controller control={control} name="phone" rules={{ required: 'Phone number is required' }}
        render={({ field: { onChange, value } }) => (
          <AppInput label="Phone" value={value} onChangeText={onChange} keyboardType="phone-pad" error={!!errors.phone} errorText={errors.phone?.message} />
        )}
      />
      <Controller control={control} name="address" rules={{ required: 'Address is required' }}
        render={({ field: { onChange, value } }) => (
          <AppInput label="Address" value={value} onChangeText={onChange} error={!!errors.address} errorText={errors.address?.message} />
        )}
      />
      <Controller control={control} name="city" rules={{ required: 'City is required' }}
        render={({ field: { onChange, value } }) => (
          <AppInput label="City" value={value} onChangeText={onChange} error={!!errors.city} errorText={errors.city?.message} />
        )}
      />

      {role === 'parent' ? (
        <Controller control={control} name="budget" rules={{
          required: 'Monthly budget is required',
          pattern: { value: /^\d+$/, message: 'Enter a valid amount (numbers only)' },
        }}
          render={({ field: { onChange, value } }) => (
            <AppInput label="Monthly Budget (₹)" value={value} onChangeText={onChange} keyboardType="numeric" error={!!errors.budget} errorText={errors.budget?.message} />
          )}
        />
      ) : (
        <>
          <Controller control={control} name="experienceYears" rules={{
            required: 'Experience is required',
            pattern: { value: /^\d+$/, message: 'Enter years of experience (numbers only)' },
          }}
            render={({ field: { onChange, value } }) => (
              <AppInput label="Years of Experience" value={value} onChangeText={onChange} keyboardType="numeric" error={!!errors.experienceYears} errorText={errors.experienceYears?.message} />
            )}
          />
          <Controller control={control} name="aboutMe"
            render={({ field: { onChange, value } }) => (
              <AppInput label="About You (optional)" value={value} onChangeText={onChange} multiline error={!!errors.aboutMe} errorText={errors.aboutMe?.message} />
            )}
          />
        </>
      )}

      <Controller control={control} name="password" rules={{
        required: 'Password is required',
        minLength: { value: 8, message: 'Password must be at least 8 characters' },
      }}
        render={({ field: { onChange, value } }) => (
          <AppInput label="Password" value={value} onChangeText={onChange} secureTextEntry error={!!errors.password} errorText={errors.password?.message} />
        )}
      />
      <Controller control={control} name="confirmPassword" rules={{ required: 'Please confirm your password' }}
        render={({ field: { onChange, value } }) => (
          <AppInput label="Confirm Password" value={value} onChangeText={onChange} secureTextEntry error={!!errors.confirmPassword} errorText={errors.confirmPassword?.message} />
        )}
      />

      <AppButton title="Register" onPress={handleSubmit(onSubmit)} loading={loading} />
      <AppButton title="Already have an account?" onPress={() => navigation.goBack()} mode="text" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, backgroundColor: colors.background },
  title: { color: colors.primary, fontWeight: '700', marginBottom: spacing.lg },
  banner: { marginBottom: spacing.md, backgroundColor: '#FEE2E2' },
  segment: { marginBottom: spacing.lg },
});
