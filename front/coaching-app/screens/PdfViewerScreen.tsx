import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DriveEmbedViewer } from '../components/DriveEmbedViewer';
import { getMediaById } from '../lib/mediaStore';

type Props = {
  id: string;
  onClose: () => void;
};

export function PdfViewerScreen({ id, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [fileId, setFileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const item = await getMediaById(id);
      if (item?.type === 'pdf') {
        setTitle(item.title);
        setFileId(item.driveFileId);
      }
      setLoading(false);
    })();
  }, [id]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.headerMeta}>
          <Text style={styles.title} numberOfLines={1}>
            {title || 'Document'}
          </Text>
          <Text style={styles.badge}>🔒 Protected · No download</Text>
        </View>
      </View>
      <View style={styles.viewer}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : fileId ? (
          <DriveEmbedViewer fileId={fileId} />
        ) : (
          <Text style={styles.error}>PDF not found.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  backBtn: { padding: 6 },
  backText: { color: '#4f46e5', fontWeight: '700', fontSize: 15 },
  headerMeta: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  badge: { fontSize: 11, color: '#64748b', marginTop: 2 },
  viewer: {
    flex: 1,
    margin: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff'
  },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#dc2626', textAlign: 'center', marginTop: 40 }
});
