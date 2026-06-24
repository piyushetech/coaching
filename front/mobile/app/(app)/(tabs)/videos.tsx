import { useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { MediaList } from '@/components/MediaList';
import { useAuth } from '@/lib/auth';
import type { MediaItem } from '@/lib/types';

export default function VideosScreen() {
  const { media, refreshMedia } = useAuth();
  const videos = media.filter((m) => m.type === 'video');

  useFocusEffect(
    useCallback(() => {
      void refreshMedia();
    }, [refreshMedia])
  );

  function openVideo(item: MediaItem) {
    router.push({ pathname: '/video/[id]', params: { id: item.id, title: item.title, url: item.url } });
  }

  return (
    <View style={styles.screen}>
      <MediaList items={videos} emptyLabel="No videos available for your courses yet." onOpen={openVideo} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' }
});
