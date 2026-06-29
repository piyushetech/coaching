import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Chip, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { NannyProfile } from '../types';
import { formatRate } from '../services/endpoints';
import { formatLocation } from '../utils/format';
import { colors, borderRadius, spacing } from '../theme';

interface Props {
  nanny: NannyProfile;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  distance?: string;
  compact?: boolean;
}

export const NannyProfileCard: React.FC<Props> = ({
  nanny,
  onPress,
  onFavorite,
  isFavorite,
  distance,
  compact = false,
}) => {
  const address = formatLocation(nanny.location);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.photoRow}>
        {nanny.profilePicture ? (
          <Image source={{ uri: nanny.profilePicture }} style={styles.photo} />
        ) : (
          <Avatar.Text size={compact ? 64 : 80} label={nanny.fullName.charAt(0)} style={styles.avatarPlaceholder} />
        )}
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text variant="titleMedium" style={styles.name} numberOfLines={1}>{nanny.fullName}</Text>
            {nanny.isOnline && <View style={styles.onlineDot} />}
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.rating}>{nanny.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({nanny.reviewCount})</Text>
          </View>
          <Text style={styles.rate}>{formatRate(nanny)}</Text>
        </View>
        {onFavorite && (
          <TouchableOpacity onPress={onFavorite} style={styles.favBtn}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? colors.error : colors.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.details}>
        <DetailRow icon="briefcase-outline" label="Experience" value={`${nanny.experienceYears} years`} />
        {nanny.phone ? <DetailRow icon="call-outline" label="Phone" value={nanny.phone} /> : null}
        {address ? <DetailRow icon="location-outline" label="Address" value={`${address}${distance ? ` · ${distance}` : ''}`} /> : null}
        {nanny.languages?.length > 0 ? (
          <DetailRow icon="language-outline" label="Languages" value={nanny.languages.join(', ')} />
        ) : null}
      </View>

      {nanny.aboutMe && !compact ? (
        <Text style={styles.about} numberOfLines={2}>{nanny.aboutMe}</Text>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.badges}>
          {nanny.backgroundVerified && (
            <Chip compact style={styles.chip} textStyle={styles.chipText}>Verified</Chip>
          )}
          {nanny.certifications?.cpr && (
            <Chip compact style={styles.chip} textStyle={styles.chipText}>CPR</Chip>
          )}
          {nanny.instantHire && (
            <Chip compact style={[styles.chip, styles.instantChip]} textStyle={styles.chipText}>Instant</Chip>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const DetailRow = ({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon} size={16} color={colors.primary} />
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
  </View>
);

/** @deprecated use NannyProfileCard */
export const NannyCard = NannyProfileCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoRow: { flexDirection: 'row', alignItems: 'center' },
  photo: { width: 80, height: 80, borderRadius: borderRadius.lg },
  avatarPlaceholder: { backgroundColor: colors.primaryLight },
  headerInfo: { flex: 1, marginLeft: spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontWeight: '700', color: colors.text, flex: 1 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginLeft: spacing.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rating: { marginLeft: 4, fontWeight: '600', fontSize: 13, color: colors.text },
  reviews: { fontSize: 13, color: colors.textSecondary },
  rate: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 4 },
  favBtn: { padding: spacing.sm },
  details: { marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.xs },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  detailLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', minWidth: 72 },
  detailValue: { flex: 1, fontSize: 13, color: colors.text },
  about: { marginTop: spacing.sm, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  footer: { marginTop: spacing.sm },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { backgroundColor: colors.primaryLight, height: 26 },
  instantChip: { backgroundColor: '#DCFCE7' },
  chipText: { fontSize: 11, color: colors.primary },
});
