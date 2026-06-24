import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { LockedOverlay } from '../components/AccessGate';
import type { PublicMedia } from '../lib/mediaStore';

type Props = {
  items: PublicMedia[];
  hasAccess: boolean;
  blockReason: string;
  onOpen: (id: string) => void;
};

export function VideosTab({ items, hasAccess, blockReason, onOpen }: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Video Library</Text>
          <Text style={styles.bannerSub}>
            {hasAccess
              ? `${items.length} video${items.length === 1 ? '' : 's'} available`
              : 'Content locked — contact admin for access'}
          </Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>No videos yet. Admin can add Google Drive videos.</Text>
      }
      renderItem={({ item, index }) => (
        <Pressable
          style={styles.cardWrap}
          onPress={() => hasAccess && onOpen(item.id)}
          disabled={!hasAccess}
        >
          <View style={[styles.card, !hasAccess && styles.cardLocked]}>
            <View style={styles.thumb}>
              <Text style={[styles.play, !hasAccess && styles.muted]}>▶</Text>
            </View>
            <View style={styles.meta}>
              <Text style={[styles.num, !hasAccess && styles.muted]}>Video {index + 1}</Text>
              <Text style={[styles.title, !hasAccess && styles.muted]}>{item.title}</Text>
              <Text style={[styles.sub, !hasAccess && styles.muted]}>{item.course}</Text>
            </View>
          </View>
          {!hasAccess ? <LockedOverlay message={blockReason} /> : null}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12, flexGrow: 1 },
  banner: {
    backgroundColor: '#eef2ff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 4
  },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: '#312e81' },
  bannerSub: { fontSize: 13, color: '#6366f1', marginTop: 4 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 32, fontSize: 14 },
  cardWrap: { position: 'relative', borderRadius: 14, overflow: 'hidden' },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardLocked: { opacity: 0.55 },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center'
  },
  play: { fontSize: 22, color: '#2563eb' },
  meta: { flex: 1, justifyContent: 'center' },
  num: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  title: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginTop: 2 },
  sub: { fontSize: 12, color: '#64748b', marginTop: 4 },
  muted: { color: '#94a3b8' }
});
