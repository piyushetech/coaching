import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  message: string;
};

export function NoAccessBanner({ title, message }: Props) {
  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

type OverlayProps = {
  message: string;
};

/** Blur overlay for locked video cards. */
export function LockedOverlay({ message }: OverlayProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.overlay}>
        <View style={styles.webBlur} />
        <Text style={styles.overlayText}>🔒 {message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      <Text style={styles.overlayText}>🔒 {message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f8fafc'
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 10
  },
  message: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    overflow: 'hidden'
  },
  webBlur: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.75)'
  },
  overlayText: {
    fontWeight: '800',
    color: '#334155',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
    zIndex: 2
  }
});
