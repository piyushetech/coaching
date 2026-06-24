import { useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MediaList } from '@/components/MediaList';
import { useAuth } from '@/lib/auth';
import type { MediaItem } from '@/lib/types';

export default function DocumentsScreen() {
  const { media, refreshMedia } = useAuth();
  const docs = media.filter((m) => m.type === 'pdf');

  useFocusEffect(
    useCallback(() => {
      void refreshMedia();
    }, [refreshMedia])
  );

  function openPdf(item: MediaItem) {
    router.push({ pathname: '/pdf/[id]', params: { id: item.id, title: item.title, url: item.url } });
  }

  return (
    <View style={styles.screen}>
      <MediaList items={docs} emptyLabel="No PDF documents available for your courses yet." onOpen={openPdf} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' }
});
