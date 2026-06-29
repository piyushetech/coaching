import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton, LoadingScreen } from '../../components/ui';
import { searchApi, hiringApi, reviewApi, formatRate, parentApi } from '../../services/endpoints';
import { formatLocation } from '../../utils/format';
import { colors, spacing, borderRadius } from '../../theme';
import { ParentStackParamList } from '../../navigation/types';
import { Alert } from 'react-native';

type Props = NativeStackScreenProps<ParentStackParamList, 'NannyDetail'>;

const DetailItem = ({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) => (
  <View style={styles.detailItem}>
    <Ionicons name={icon} size={20} color={colors.primary} />
    <View style={styles.detailText}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

export const NannyDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { nannyId } = route.params;
  const { data: nanny, isLoading } = useQuery({
    queryKey: ['nanny', nannyId],
    queryFn: () => searchApi.getById(nannyId).then((r) => r.data.data),
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', nannyId],
    queryFn: () => reviewApi.getForNanny(nannyId).then((r) => r.data.data),
  });

  const hireMutation = useMutation({
    mutationFn: () => hiringApi.create({ nannyId, pricingType: nanny?.pricingType }),
    onSuccess: () => {
      Alert.alert('Success', 'Hiring request sent!');
      navigation.navigate('Hiring');
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      Alert.alert('Error', message);
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: () => parentApi.addFavorite(nannyId),
    onSuccess: () => Alert.alert('Saved', 'Added to favorites'),
  });

  if (isLoading || !nanny) return <LoadingScreen />;

  const skillLabels: Record<string, string> = {
    cooking: 'Cooking', cleaning: 'Cleaning', infantCare: 'Infant Care',
    toddlerCare: 'Toddler Care', specialNeeds: 'Special Needs', homeworkHelp: 'Homework',
    petFriendly: 'Pet Friendly', nightShift: 'Night Shift', weekendAvailable: 'Weekends',
  };

  const address = formatLocation(nanny.location);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        {nanny.profilePicture ? (
          <Image source={{ uri: nanny.profilePicture }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Text style={styles.initial}>{nanny.fullName.charAt(0)}</Text>
          </View>
        )}
        <Text variant="headlineSmall" style={styles.name}>{nanny.fullName}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={18} color={colors.warning} />
          <Text style={styles.rating}>{nanny.rating.toFixed(1)} ({nanny.reviewCount} reviews)</Text>
        </View>
        <Text style={styles.rate}>{formatRate(nanny)}</Text>
        <Text style={styles.pricingType}>
          {nanny.pricingType === 'hourly' ? 'Hourly Rate' : nanny.pricingType === 'daily' ? 'Daily Rate' : 'Monthly Salary'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Contact & Details</Text>
        <DetailItem icon="call-outline" label="Phone" value={nanny.phone || 'Not provided'} />
        <DetailItem icon="location-outline" label="Address" value={address || 'Not provided'} />
        <DetailItem icon="briefcase-outline" label="Experience" value={`${nanny.experienceYears} years`} />
        {nanny.languages?.length > 0 && (
          <DetailItem icon="language-outline" label="Languages" value={nanny.languages.join(', ')} />
        )}
        {nanny.gender && (
          <DetailItem icon="person-outline" label="Gender" value={nanny.gender} />
        )}
        {nanny.age != null && (
          <DetailItem icon="calendar-outline" label="Age" value={String(nanny.age)} />
        )}
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>About</Text>
        <Text style={styles.about}>{nanny.aboutMe || 'No description provided.'}</Text>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Skills</Text>
        <View style={styles.chips}>
          {Object.entries(nanny.skills).filter(([, v]) => v).map(([k]) => (
            <Chip key={k} style={styles.chip}>{skillLabels[k] || k}</Chip>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Verification</Text>
        <View style={styles.verifyRow}>
          {nanny.backgroundVerified && <Chip icon="shield-check" style={styles.verifiedChip}>Background</Chip>}
          {nanny.policeVerified && <Chip icon="shield-check" style={styles.verifiedChip}>Police</Chip>}
          {nanny.certifications.cpr && <Chip style={styles.chip}>CPR</Chip>}
          {nanny.certifications.firstAid && <Chip style={styles.chip}>First Aid</Chip>}
        </View>
      </View>

      {reviews && reviews.length > 0 && (
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Reviews</Text>
          {reviews.slice(0, 3).map((r) => (
            <View key={r._id} style={styles.review}>
              <Text style={styles.reviewRating}>{'★'.repeat(r.rating)}</Text>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <AppButton title="Hire Nanny" onPress={() => hireMutation.mutate()} loading={hireMutation.isPending} icon="handshake" />
        <AppButton title="Save to Favorites" onPress={() => favoriteMutation.mutate()} mode="outlined" icon="heart" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { alignItems: 'center', padding: spacing.lg, backgroundColor: colors.surface },
  photo: { width: 120, height: 120, borderRadius: borderRadius.lg },
  photoPlaceholder: { backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  initial: { fontSize: 48, color: colors.primary, fontWeight: '700' },
  name: { marginTop: spacing.md, fontWeight: '700', color: colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  rating: { marginLeft: 4, color: colors.textSecondary },
  rate: { fontSize: 24, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },
  pricingType: { fontSize: 13, color: colors.textSecondary },
  section: { padding: spacing.lg, backgroundColor: colors.surface, marginTop: spacing.sm },
  sectionTitle: { fontWeight: '600', marginBottom: spacing.sm, color: colors.text },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md, gap: spacing.sm },
  detailText: { flex: 1 },
  detailLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  detailValue: { fontSize: 15, color: colors.text, marginTop: 2 },
  about: { color: colors.textSecondary, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.primaryLight },
  verifiedChip: { backgroundColor: '#DCFCE7' },
  verifyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  review: { marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  reviewRating: { color: colors.warning },
  reviewComment: { color: colors.textSecondary, marginTop: 4 },
  actions: { padding: spacing.lg, gap: spacing.sm },
});
