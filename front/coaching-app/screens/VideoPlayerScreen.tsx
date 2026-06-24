import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DriveEmbedViewer } from '../components/DriveEmbedViewer';
import { getMediaById } from '../lib/mediaStore';

type Props = {
  id: string;
  onClose: () => void;
};

export function VideoPlayerScreen({ id, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [fileId, setFileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const item = await getMediaById(id);
      if (item?.type === 'video') {
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
        <Text style={styles.title} numberOfLines={2}>
          {title || 'Video'}
        </Text>
      </View>
      <View style={styles.playerWrap}>
        {loading ? (
          <ActivityIndicator size="large" color="#93c5fd" />
        ) : fileId ? (
          <DriveEmbedViewer fileId={fileId} />
        ) : (
          <Text style={styles.error}>Video not found.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#1e293b'
  },
  backBtn: { paddingVertical: 4, paddingRight: 8 },
  backText: { color: '#93c5fd', fontWeight: '700', fontSize: 15 },
  title: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 15 },
  playerWrap: { flex: 1, backgroundColor: '#000' },
  error: { color: '#fca5a5', textAlign: 'center', marginTop: 40 }
});
