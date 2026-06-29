import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Avatar, List, Switch } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/ui';
import { ProfileCompletionBar } from '../../components/ProfileCompletionBar';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { toggleDarkMode, clearAuth } from '../../store/authSlice';
import { clearTokens } from '../../hooks/useAuthInit';
import { disconnectSocket } from '../../services/socket';
import { authApi } from '../../services/endpoints';
import { formatBudget, formatLocation } from '../../utils/format';
import { colors, spacing, borderRadius } from '../../theme';
import { ParentProfile, NannyProfile } from '../../types';

const DetailRow = ({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon} size={18} color={colors.primary} />
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

export const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, profile, darkMode } = useAppSelector((s) => s.auth);
  const isParent = user?.role === 'parent';
  const parentProfile = isParent ? (profile as ParentProfile) : null;
  const nannyProfile = !isParent ? (profile as NannyProfile) : null;

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    await clearTokens();
    disconnectSocket();
    dispatch(clearAuth());
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {profile?.profilePicture ? (
          <Image source={{ uri: profile.profilePicture }} style={styles.photo} />
        ) : (
          <Avatar.Text size={80} label={profile?.fullName?.charAt(0) || 'U'} style={styles.avatar} />
        )}
        <Text variant="headlineSmall" style={styles.name}>{profile?.fullName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <ProfileCompletionBar label="Profile Completion" percentage={profile?.profileCompletion || 0} />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {isParent ? 'Parent Details' : 'Nanny Details'}
        </Text>
        <DetailRow icon="call-outline" label="Phone" value={profile?.phone || 'Not provided'} />
        <DetailRow icon="location-outline" label="Address" value={formatLocation(profile?.location) || 'Not provided'} />
        {isParent && parentProfile ? (
          <DetailRow icon="wallet-outline" label="Monthly Budget" value={formatBudget(parentProfile.budget)} />
        ) : null}
        {nannyProfile ? (
          <>
            <DetailRow icon="briefcase-outline" label="Experience" value={`${nannyProfile.experienceYears} years`} />
            {nannyProfile.aboutMe ? (
              <DetailRow icon="document-text-outline" label="About" value={nannyProfile.aboutMe} />
            ) : null}
          </>
        ) : null}
      </View>

      <List.Section>
        <List.Item title="Dark Mode" right={() => (
          <Switch value={darkMode} onValueChange={() => dispatch(toggleDarkMode())} color={colors.primary} />
        )} />
        <List.Item title="Email Verified" description={user?.isEmailVerified ? 'Yes' : 'No'} left={(props) => <List.Icon {...props} icon="email-check" />} />
        <List.Item title="Role" description={user?.role} left={(props) => <List.Icon {...props} icon="account" />} />
      </List.Section>

      <View style={styles.logout}>
        <AppButton title="Logout" onPress={handleLogout} mode="outlined" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', padding: spacing.xl, backgroundColor: colors.surface },
  photo: { width: 80, height: 80, borderRadius: borderRadius.lg },
  avatar: { backgroundColor: colors.primaryLight },
  name: { marginTop: spacing.md, fontWeight: '700', color: colors.text },
  email: { color: colors.textSecondary, marginTop: spacing.xs },
  section: { padding: spacing.lg, backgroundColor: colors.surface, marginTop: spacing.sm },
  sectionTitle: { fontWeight: '600', marginBottom: spacing.md, color: colors.text },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md, gap: spacing.sm },
  detailLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', minWidth: 100 },
  detailValue: { flex: 1, fontSize: 14, color: colors.text },
  logout: { padding: spacing.lg },
});
