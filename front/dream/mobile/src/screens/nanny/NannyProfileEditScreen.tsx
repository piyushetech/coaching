import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, SegmentedButtons, Switch } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppButton, AppInput } from '../../components/ui';
import { ProfileCompletionBar } from '../../components/ProfileCompletionBar';
import { useAppSelector } from '../../hooks/redux';
import { nannyApi } from '../../services/endpoints';
import { colors, spacing } from '../../theme';
import { NannyProfile, PricingType } from '../../types';

export const NannyProfileEditScreen: React.FC = () => {
  const profile = useAppSelector((s) => s.auth.profile) as NannyProfile;
  const queryClient = useQueryClient();
  const [pricingType, setPricingType] = useState<PricingType>(profile?.pricingType || 'hourly');

  const { control, handleSubmit } = useForm({
    defaultValues: {
      fullName: profile?.fullName || '',
      aboutMe: profile?.aboutMe || '',
      experienceYears: String(profile?.experienceYears || 0),
      hourlyRate: String(profile?.hourlyRate || ''),
      dailyRate: String(profile?.dailyRate || ''),
      monthlySalary: String(profile?.monthlySalary || ''),
    },
  });

  const mutation = useMutation({
    mutationFn: (data: object) => nannyApi.updateProfile(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['nanny-profile'] }),
  });

  const onSubmit = (data: Record<string, string>) => {
    mutation.mutate({
      fullName: data.fullName,
      aboutMe: data.aboutMe,
      experienceYears: parseInt(data.experienceYears, 10),
      pricingType,
      hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : undefined,
      dailyRate: data.dailyRate ? parseFloat(data.dailyRate) : undefined,
      monthlySalary: data.monthlySalary ? parseFloat(data.monthlySalary) : undefined,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ProfileCompletionBar label="Profile Completion" percentage={profile?.profileCompletion || 0} />

      <Controller control={control} name="fullName" render={({ field: { onChange, value } }) => (
        <AppInput label="Full Name" value={value} onChangeText={onChange} />
      )} />
      <Controller control={control} name="aboutMe" render={({ field: { onChange, value } }) => (
        <AppInput label="About Me" value={value} onChangeText={onChange} multiline />
      )} />
      <Controller control={control} name="experienceYears" render={({ field: { onChange, value } }) => (
        <AppInput label="Experience (Years)" value={value} onChangeText={onChange} keyboardType="numeric" />
      )} />

      <Text variant="titleMedium" style={styles.sectionTitle}>Pricing Model</Text>
      <SegmentedButtons
        value={pricingType}
        onValueChange={(v) => setPricingType(v as PricingType)}
        buttons={[
          { value: 'hourly', label: 'Hourly' },
          { value: 'daily', label: 'Daily' },
          { value: 'monthly', label: 'Monthly' },
        ]}
        style={styles.segment}
      />

      {pricingType === 'hourly' && (
        <Controller control={control} name="hourlyRate" render={({ field: { onChange, value } }) => (
          <AppInput label="Hourly Rate (₹)" value={value} onChangeText={onChange} keyboardType="numeric" />
        )} />
      )}
      {pricingType === 'daily' && (
        <Controller control={control} name="dailyRate" render={({ field: { onChange, value } }) => (
          <AppInput label="Daily Rate (₹)" value={value} onChangeText={onChange} keyboardType="numeric" />
        )} />
      )}
      {pricingType === 'monthly' && (
        <Controller control={control} name="monthlySalary" render={({ field: { onChange, value } }) => (
          <AppInput label="Monthly Salary (₹)" value={value} onChangeText={onChange} keyboardType="numeric" />
        )} />
      )}

      <AppButton title="Save Profile" onPress={handleSubmit(onSubmit)} loading={mutation.isPending} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  sectionTitle: { fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.sm, color: colors.text },
  segment: { marginBottom: spacing.md },
});
