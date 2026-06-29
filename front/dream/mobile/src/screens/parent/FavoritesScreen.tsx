import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState, LoadingScreen } from '../../components/ui';
import { parentApi } from '../../services/endpoints';
import { NannyProfileCard } from '../../components/NannyCard';
import { colors, spacing } from '../../theme';
import { ParentStackParamList } from '../../navigation/types';
import { NannyProfile } from '../../types';

type Props = NativeStackScreenProps<ParentStackParamList, 'Favorites'>;

export const FavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => parentApi.getFavorites().then((r) => r.data.data),
  });

  if (isLoading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={data || []}
        keyExtractor={(item: { _id: string }) => item._id}
        renderItem={({ item }: { item: { nanny: NannyProfile } }) => (
          <NannyProfileCard
            nanny={item.nanny}
            onPress={() => navigation.navigate('NannyDetail', { nannyId: item.nanny._id })}
            isFavorite
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No saved nannies yet." action={() => navigation.navigate('Home')} actionLabel="Browse Nannies" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
});
