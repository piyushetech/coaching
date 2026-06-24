import * as ScreenCapture from 'expo-screen-capture';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { drivePreviewUrl } from '../lib/drive';

const GUARD_SCRIPT = `
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.body.style.userSelect = 'none';
  true;
`;

type Props = {
  fileId: string;
  blockScreenshots?: boolean;
};

/** Embedded Google Drive viewer — link is never shown in the UI. */
export function DriveEmbedViewer({ fileId, blockScreenshots = true }: Props) {
  const uri = drivePreviewUrl(fileId);

  useEffect(() => {
    if (!blockScreenshots || Platform.OS === 'web') return;
    void ScreenCapture.preventScreenCaptureAsync();
    return () => {
      void ScreenCapture.allowScreenCaptureAsync();
    };
  }, [blockScreenshots]);

  return (
    <WebView
      source={{ uri }}
      style={styles.webview}
      startInLoadingState
      renderLoading={() => (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      )}
      injectedJavaScript={GUARD_SCRIPT}
      javaScriptEnabled
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      allowFileAccess={false}
      allowFileAccessFromFileURLs={false}
      allowUniversalAccessFromFileURLs={false}
      setSupportMultipleWindows={false}
      originWhitelist={['https://*']}
      onFileDownload={() => {}}
      {...(Platform.OS === 'android' ? { nestedScrollEnabled: true } : {})}
    />
  );
}

const styles = StyleSheet.create({
  webview: { flex: 1, backgroundColor: '#fff' },
  loader: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  }
});
