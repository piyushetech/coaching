import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState, LoadingScreen } from '../../components/ui';
import { hiringApi } from '../../services/endpoints';
import { colors, spacing, borderRadius } from '../../theme';
import { ParentStackParamList } from '../../navigation/types';
import { HiringRequest } from '../../types';

type Props = NativeStackScreenProps<ParentStackParamList, 'Hiring'>;

const statusColors: Record<string, string> = {
  pending: colors.warning,
  accepted: colors.success,
  rejected: colors.error,
  confirmed: colors.primary,
  completed: colors.secondary,
  cancelled: colors.error,
};

export const HiringScreen: React.FC<Props> = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['hiring-requests'],
    queryFn: () => hiringApi.getRequests().then((r) => r.data.data),
  });

  if (isLoading) return <LoadingScreen />;

  const renderItem = ({ item }: { item: HiringRequest }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.name}>{item.nanny.fullName}</Text>
        <Chip style={[styles.statusChip, { backgroundColor: statusColors[item.status] + '20' }]}>
          <Text style={{ color: statusColors[item.status], fontSize: 12 }}>{item.status}</Text>
        </Chip>
      </View>
      <Text style={styles.rate}>
        {item.pricingType === 'hourly' ? 'Hourly' : item.pricingType === 'daily' ? 'Daily' : 'Monthly'} hire
      </Text>
      {item.message && <Text style={styles.message}>{item.message}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data || []}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No hiring requests yet." />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: '600', color: colors.text },
  statusChip: { height: 28 },
  rate: { color: colors.primary, fontWeight: '600', marginTop: spacing.sm },
  message: { color: colors.textSecondary, marginTop: spacing.sm },
});
