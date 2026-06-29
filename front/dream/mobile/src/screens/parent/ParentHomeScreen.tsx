import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, Chip } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { NannyProfileCard } from '../../components/NannyCard';
import { EmptyState, LoadingScreen } from '../../components/ui';
import { searchApi } from '../../services/endpoints';
import { colors, spacing } from '../../theme';
import { ParentStackParamList } from '../../navigation/types';
import { SearchFilters } from '../../types';

type Props = NativeStackScreenProps<ParentStackParamList, 'Home'>;

export const ParentHomeScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['search', search, filters, location],
    queryFn: async () => {
      const params: SearchFilters = { ...filters, q: search || undefined };
      if (location) {
        params.lat = location.lat;
        params.lng = location.lng;
        params.distance = 50000;
      }
      const res = await searchApi.search(params);
      return res.data;
    },
  });

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search nannies..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        iconColor={colors.primary}
      />

      <View style={styles.filters}>
        <Chip selected={!!location} onPress={requestLocation} style={styles.chip}>Nearby</Chip>
        <Chip selected={filters.verifiedOnly} onPress={() => setFilters((f) => ({ ...f, verifiedOnly: !f.verifiedOnly }))} style={styles.chip}>Verified</Chip>
        <Chip selected={filters.pricingType === 'hourly'} onPress={() => setFilters((f) => ({ ...f, pricingType: f.pricingType === 'hourly' ? undefined : 'hourly' }))} style={styles.chip}>Hourly</Chip>
        <Chip selected={filters.pricingType === 'daily'} onPress={() => setFilters((f) => ({ ...f, pricingType: f.pricingType === 'daily' ? undefined : 'daily' }))} style={styles.chip}>Daily</Chip>
        <Chip selected={filters.pricingType === 'monthly'} onPress={() => setFilters((f) => ({ ...f, pricingType: f.pricingType === 'monthly' ? undefined : 'monthly' }))} style={styles.chip}>Monthly</Chip>
      </View>

      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <NannyProfileCard
            nanny={item}
            onPress={() => navigation.navigate('NannyDetail', { nannyId: item._id })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[colors.primary]} />}
        ListEmptyComponent={<EmptyState message="No nannies found. Try adjusting filters." />}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  search: { margin: spacing.md, backgroundColor: colors.surface, elevation: 0 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md, gap: spacing.sm, marginBottom: spacing.sm },
  chip: { backgroundColor: colors.surface },
  list: { padding: spacing.md, paddingTop: 0 },
});
