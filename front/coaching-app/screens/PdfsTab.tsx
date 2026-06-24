import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NoAccessBanner } from '../components/AccessGate';
import type { PublicMedia } from '../lib/mediaStore';

type Props = {
  items: PublicMedia[];
  hasAccess: boolean;
  blockReason: string;
  onOpen: (id: string) => void;
};

export function PdfsTab({ items, hasAccess, blockReason, onOpen }: Props) {
  if (!hasAccess) {
    return <NoAccessBanner title="You don't have access" message={blockReason} />;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>PDF Documents</Text>
          <Text style={styles.bannerSub}>
            {items.length} document{items.length === 1 ? '' : 's'} · view only, link hidden
          </Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>No PDFs yet. Admin can add Google Drive PDFs.</Text>
      }
      renderItem={({ item, index }) => (
        <Pressable style={styles.card} onPress={() => onOpen(item.id)}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>PDF</Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.num}>Document {index + 1}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>{item.course}</Text>
          </View>
          <Text style={styles.lock}>🔒</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12, flexGrow: 1 },
  banner: {
    backgroundColor: '#fdf2f8',
    borderRadius: 14,
    padding: 16,
    marginBottom: 4
  },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: '#831843' },
  bannerSub: { fontSize: 13, color: '#db2777', marginTop: 4 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 32, fontSize: 14 },
  card: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#fce7f3',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconText: { fontWeight: '800', color: '#be185d', fontSize: 12 },
  meta: { flex: 1 },
  num: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  title: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginTop: 2 },
  sub: { fontSize: 12, color: '#64748b', marginTop: 4 },
  lock: { fontSize: 16, opacity: 0.6 }
});
