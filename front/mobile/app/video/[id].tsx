import { ResizeMode, Video } from 'expo-av';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { resolveMediaUrl } from '@/lib/media';

export default function VideoPlayerScreen() {
  const { title, url } = useLocalSearchParams<{ id: string; title?: string; url?: string }>();

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: title || 'Video' }} />
      <Video
        style={styles.video}
        source={{ uri: resolveMediaUrl(url) }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  video: { width: '100%', height: '100%' }
});
