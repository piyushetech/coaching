import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState, LoadingScreen } from '../../components/ui';
import { chatApi } from '../../services/endpoints';
import { colors, spacing, borderRadius } from '../../theme';
import { ParentStackParamList } from '../../navigation/types';
import { Chat } from '../../types';

type Props = NativeStackScreenProps<ParentStackParamList, 'Messages'>;

export const MessagesScreen: React.FC<Props> = ({ navigation }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatApi.getChats().then((r) => r.data.data),
  });

  if (isLoading) return <LoadingScreen />;

  const renderItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ChatRoom', { chatId: item._id })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.participants[0]?.email?.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text variant="titleSmall" style={styles.name}>
          {item.participants.map((p) => p.email).join(', ')}
        </Text>
        <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage || 'No messages yet'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data || []}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No conversations yet." />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: colors.primary, fontWeight: '700', fontSize: 18 },
  info: { flex: 1, marginLeft: spacing.md },
  name: { fontWeight: '600', color: colors.text },
  lastMsg: { color: colors.textSecondary, marginTop: 2, fontSize: 13 },
});
