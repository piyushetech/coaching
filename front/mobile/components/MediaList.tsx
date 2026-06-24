import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { MediaItem } from '@/lib/types';
import { resolveMediaUrl } from '@/lib/media';

type Props = {
  items: MediaItem[];
  emptyLabel: string;
  onOpen: (item: MediaItem) => void;
};

export function MediaList({ items, emptyLabel, onOpen }: Props) {
  if (!items.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => onOpen(item)}>
          <View style={[styles.icon, item.type === 'video' ? styles.videoIcon : styles.pdfIcon]}>
            <Text style={styles.iconText}>{item.type === 'video' ? '▶' : 'PDF'}</Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>
              {item.course.toUpperCase()} · {item.size || '—'} · {item.dateModified || '—'}
            </Text>
            {item.description ? <Text style={styles.desc} numberOfLines={2}>{item.description}</Text> : null}
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoIcon: { backgroundColor: '#dbeafe' },
  pdfIcon: { backgroundColor: '#fce7f3' },
  iconText: { fontWeight: '800', color: '#334155', fontSize: 13 },
  meta: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  sub: { fontSize: 12, color: '#64748b', marginTop: 4 },
  desc: { fontSize: 13, color: '#475569', marginTop: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { color: '#64748b', fontSize: 15, textAlign: 'center' }
});
