import React from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppButton, EmptyState, LoadingScreen } from '../../components/ui';
import { hiringApi } from '../../services/endpoints';
import { colors, spacing, borderRadius } from '../../theme';
import { HiringRequest } from '../../types';

export const NannyRequestsScreen: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['nanny-requests'],
    queryFn: () => hiringApi.getRequests({ status: 'pending' }).then((r) => r.data.data),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'reject' }) =>
      hiringApi.respond(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nanny-requests'] });
      Alert.alert('Done', 'Response submitted');
    },
  });

  if (isLoading) return <LoadingScreen />;

  const renderItem = ({ item }: { item: HiringRequest }) => (
    <View style={styles.card}>
      <Text variant="titleMedium" style={styles.name}>{item.parent.fullName}</Text>
      <Chip style={styles.chip}>
        {item.pricingType === 'hourly' ? 'Hourly' : item.pricingType === 'daily' ? 'Daily' : 'Monthly'}
      </Chip>
      {item.message && <Text style={styles.message}>{item.message}</Text>}
      <View style={styles.actions}>
        <AppButton title="Accept" onPress={() => respondMutation.mutate({ id: item._id, action: 'accept' })} />
        <AppButton title="Reject" onPress={() => respondMutation.mutate({ id: item._id, action: 'reject' })} mode="outlined" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data || []}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No pending requests." />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md },
  name: { fontWeight: '600', color: colors.text },
  chip: { alignSelf: 'flex-start', marginTop: spacing.sm, backgroundColor: colors.primaryLight },
  message: { color: colors.textSecondary, marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
