import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/lib/auth';

export default function AdminDashboardScreen() {
  const { media, storage, isOwner, refreshMedia } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refreshMedia();
    }, [refreshMedia])
  );

  async function onRefresh() {
    setRefreshing(true);
    await refreshMedia();
    setRefreshing(false);
  }

  const videos = media.filter((m) => m.type === 'video').length;
  const docs = media.filter((m) => m.type === 'pdf').length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.heading}>{isOwner ? 'Head Admin Overview' : 'Admin Overview'}</Text>
      <Text style={styles.muted}>Institute-wide media counts</Text>

      <View style={styles.grid}>
        <StatCard label="Total Files" value={String(media.length)} />
        <StatCard label="Videos" value={String(videos)} />
        <StatCard label="Documents" value={String(docs)} />
      </View>

      {isOwner && storage ? (
        <View style={styles.storageCard}>
          <Text style={styles.storageTitle}>Storage</Text>
          <Text style={styles.storageBig}>{storage.percentLabel} of {storage.quotaLabel}</Text>
          <Text style={styles.muted}>{storage.usedLabel} used · Videos {storage.videoLabel} · PDFs {storage.pdfLabel}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${Math.min(100, storage.percentUsed)}%` }]} />
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16 },
  heading: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  muted: { color: '#64748b', marginTop: 4, marginBottom: 16, fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    flexGrow: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  statValue: { fontSize: 28, fontWeight: '800', color: '#4f46e5' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: '600' },
  storageCard: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  storageTitle: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  storageBig: { fontSize: 20, fontWeight: '800', color: '#0f766e', marginVertical: 6 },
  barTrack: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 8, marginTop: 10, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#4f46e5' }
});
