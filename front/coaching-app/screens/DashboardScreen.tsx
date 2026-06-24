import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkAccess, daysLeft, formatAccessDate, type AccessStatus } from '../lib/accessStore';
import type { AuthUser } from '../lib/dummyAuth';
import { listPublicMedia, type PublicMedia } from '../lib/mediaStore';
import { PdfsTab } from './PdfsTab';
import { ProfileTab } from './ProfileTab';
import { VideosTab } from './VideosTab';

type Tab = 'videos' | 'pdfs' | 'profile';

type Props = {
  user: AuthUser;
  onOpenVideo: (id: string) => void;
  onOpenPdf: (id: string) => void;
  onSignOut: () => void;
};

function blockMessage(status: AccessStatus): string {
  if (status.state === 'none') {
    return 'Your mobile is not registered. Ask the admin to grant access.';
  }
  if (status.state === 'expired') {
    return `Your access expired on ${formatAccessDate(status.grant.expiresAt)}. Contact admin to renew.`;
  }
  return '';
}

export function DashboardScreen({ user, onOpenVideo, onOpenPdf, onSignOut }: Props) {
  const [tab, setTab] = useState<Tab>('videos');
  const [access, setAccess] = useState<AccessStatus>({ state: 'none' });
  const [videos, setVideos] = useState<PublicMedia[]>([]);
  const [pdfs, setPdfs] = useState<PublicMedia[]>([]);

  const refreshAccess = useCallback(async () => {
    const status = await checkAccess(user.mobile);
    setAccess(status);
  }, [user.mobile]);

  const refreshMedia = useCallback(async () => {
    const [v, p] = await Promise.all([listPublicMedia('video'), listPublicMedia('pdf')]);
    setVideos(v);
    setPdfs(p);
  }, []);

  useEffect(() => {
    void refreshAccess();
    void refreshMedia();
  }, [refreshAccess, refreshMedia]);

  const hasAccess = access.state === 'active';
  const blockReason = blockMessage(access);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.brand}>Sankalp Coaching</Text>
        <Text style={styles.greeting}>Hi, {user.name}</Text>
        {hasAccess ? (
          <Text style={styles.accessOk}>
            Access active · {daysLeft(access.grant.expiresAt)} days left
          </Text>
        ) : (
          <Text style={styles.accessBad}>No active access</Text>
        )}
      </View>

      <View style={styles.body}>
        {tab === 'videos' ? (
          <VideosTab
            items={videos}
            hasAccess={hasAccess}
            blockReason={blockReason}
            onOpen={onOpenVideo}
          />
        ) : null}
        {tab === 'pdfs' ? (
          <PdfsTab items={pdfs} hasAccess={hasAccess} blockReason={blockReason} onOpen={onOpenPdf} />
        ) : null}
        {tab === 'profile' ? (
          <ProfileTab user={user} access={access} videoCount={videos.length} pdfCount={pdfs.length} onSignOut={onSignOut} />
        ) : null}
      </View>

      <View style={styles.tabBar}>
        <TabBtn label="Videos" active={tab === 'videos'} onPress={() => setTab('videos')} icon="▶" />
        <TabBtn label="PDFs" active={tab === 'pdfs'} onPress={() => setTab('pdfs')} icon="📄" />
        <TabBtn label="Profile" active={tab === 'profile'} onPress={() => setTab('profile')} icon="👤" />
      </View>
    </SafeAreaView>
  );
}

function TabBtn({
  label,
  icon,
  active,
  onPress
}: {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.tabBtn, active && styles.tabBtnActive]} onPress={onPress}>
      <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff'
  },
  brand: { fontSize: 13, fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 0.5 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginTop: 4 },
  accessOk: { fontSize: 12, color: '#059669', fontWeight: '600', marginTop: 4 },
  accessBad: { fontSize: 12, color: '#dc2626', fontWeight: '600', marginTop: 4 },
  body: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
    paddingBottom: 4
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabBtnActive: { borderTopWidth: 2, borderTopColor: '#4f46e5', marginTop: -1 },
  tabIcon: { fontSize: 18, opacity: 0.5 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', marginTop: 2 },
  tabLabelActive: { color: '#4f46e5', fontWeight: '800' }
});
