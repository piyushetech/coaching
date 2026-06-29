import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmptyState, LoadingScreen } from '../../components/ui';
import { notificationApi } from '../../services/endpoints';
import { colors, spacing, borderRadius } from '../../theme';
import { Notification } from '../../types';

export const NotificationsScreen: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll().then((r) => r.data),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (isLoading) return <LoadingScreen />;

  const renderItem = ({ item }: { item: Notification }) => (
    <View style={[styles.card, !item.isRead && styles.unread]}>
      <View style={styles.content}>
        <Text variant="titleSmall" style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
      </View>
      {!item.isRead && (
        <IconButton icon="check" size={20} onPress={() => markRead.mutate(item._id)} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No notifications." />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm },
  unread: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  content: { flex: 1 },
  title: { fontWeight: '600', color: colors.text },
  body: { color: colors.textSecondary, marginTop: 4, fontSize: 13 },
});
