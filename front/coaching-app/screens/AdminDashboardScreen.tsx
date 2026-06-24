import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  addAccessGrant,
  daysLeft,
  formatAccessDate,
  listAccessGrants,
  removeAccessGrant,
  type AccessGrant
} from '../lib/accessStore';
import type { AuthUser } from '../lib/dummyAuth';
import {
  addMedia,
  listAllMedia,
  removeMedia,
  type MediaItem
} from '../lib/mediaStore';

type Props = {
  user: AuthUser;
  onSignOut: () => void;
  onPreviewVideo: (id: string) => void;
  onPreviewPdf: (id: string) => void;
};

type AdminTab = 'students' | 'videos' | 'pdfs';

function grantStatus(grant: AccessGrant): 'active' | 'expired' {
  return new Date(grant.expiresAt).getTime() > Date.now() ? 'active' : 'expired';
}

export function AdminDashboardScreen({ user, onSignOut, onPreviewVideo, onPreviewPdf }: Props) {
  const [tab, setTab] = useState<AdminTab>('students');
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoCourse, setVideoCourse] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfCourse, setPdfCourse] = useState('');
  const [pdfLink, setPdfLink] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [g, m] = await Promise.all([listAccessGrants(), listAllMedia()]);
    setGrants(g);
    setMedia(m);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAddStudent() {
    const digits = mobile.replace(/\D/g, '').slice(0, 10);
    if (digits.length !== 10) {
      Alert.alert('Invalid mobile', 'Enter a valid 10-digit mobile number.');
      return;
    }
    setBusy(true);
    try {
      await addAccessGrant(digits, name);
      setMobile('');
      setName('');
      await load();
      Alert.alert('Access granted', `+91 ${digits} can view content for 1 year.`);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not add access.');
    } finally {
      setBusy(false);
    }
  }

  async function handleAddVideo() {
    setBusy(true);
    try {
      await addMedia({ type: 'video', title: videoTitle, course: videoCourse, driveLink: videoLink });
      setVideoTitle('');
      setVideoCourse('');
      setVideoLink('');
      await load();
      Alert.alert('Video added', 'Students will see the title only — not the Google Drive link.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not add video.');
    } finally {
      setBusy(false);
    }
  }

  async function handleAddPdf() {
    setBusy(true);
    try {
      await addMedia({ type: 'pdf', title: pdfTitle, course: pdfCourse, driveLink: pdfLink });
      setPdfTitle('');
      setPdfCourse('');
      setPdfLink('');
      await load();
      Alert.alert('PDF added', 'Students will see the title only — not the Google Drive link.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not add PDF.');
    } finally {
      setBusy(false);
    }
  }

  function confirmRemoveGrant(grant: AccessGrant) {
    Alert.alert('Remove access', `Remove access for +91 ${grant.mobile}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeAccessGrant(grant.mobile);
          await load();
        }
      }
    ]);
  }

  function confirmRemoveMedia(item: MediaItem) {
    Alert.alert('Delete', `Remove "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeMedia(item.id);
          await load();
        }
      }
    ]);
  }

  const videos = media.filter((m) => m.type === 'video');
  const pdfs = media.filter((m) => m.type === 'pdf');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>Admin Panel</Text>
          <Text style={styles.adminName}>{user.name} · +91 {user.mobile}</Text>
        </View>
        <Pressable style={styles.signOutBtn} onPress={onSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <TabChip label="Students" active={tab === 'students'} onPress={() => setTab('students')} />
        <TabChip label={`Videos (${videos.length})`} active={tab === 'videos'} onPress={() => setTab('videos')} />
        <TabChip label={`PDFs (${pdfs.length})`} active={tab === 'pdfs'} onPress={() => setTab('pdfs')} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#0f766e" />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {tab === 'students' ? (
            <>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Grant student access</Text>
                <Text style={styles.formSub}>1 year access to videos & PDFs. Link is never shown to students.</Text>
                <Text style={styles.label}>Name (optional)</Text>
                <TextInput style={styles.input} placeholder="Student name" value={name} onChangeText={setName} />
                <Text style={styles.label}>Mobile</Text>
                <View style={styles.phoneRow}>
                  <Text style={styles.prefix}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="9876543210"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={mobile}
                    onChangeText={(v) => setMobile(v.replace(/\D/g, '').slice(0, 10))}
                  />
                </View>
                <Pressable style={styles.addBtn} onPress={handleAddStudent} disabled={busy}>
                  {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Add / Renew</Text>}
                </Pressable>
              </View>
              {grants.map((item) => {
                const status = grantStatus(item);
                return (
                  <View key={item.mobile} style={styles.rowCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{item.name}</Text>
                      <Text style={styles.rowSub}>+91 {item.mobile}</Text>
                      <Text style={styles.rowMeta}>
                        Expires {formatAccessDate(item.expiresAt)} ·{' '}
                        {status === 'active' ? `${daysLeft(item.expiresAt)}d left` : 'Expired'}
                      </Text>
                    </View>
                    <Pressable style={styles.removeBtn} onPress={() => confirmRemoveGrant(item)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  </View>
                );
              })}
              {!grants.length ? <Text style={styles.empty}>No students added yet.</Text> : null}
            </>
          ) : null}

          {tab === 'videos' ? (
            <>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Add video (Google Drive)</Text>
                <Text style={styles.formSub}>
                  Paste share link. File must be set to &quot;Anyone with the link&quot;. Students only see the title.
                </Text>
                <Text style={styles.label}>Title</Text>
                <TextInput style={styles.input} placeholder="Video title" value={videoTitle} onChangeText={setVideoTitle} />
                <Text style={styles.label}>Course (optional)</Text>
                <TextInput style={styles.input} placeholder="NEET / JEE" value={videoCourse} onChangeText={setVideoCourse} />
                <Text style={styles.label}>Google Drive link</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={videoLink}
                  onChangeText={setVideoLink}
                  autoCapitalize="none"
                />
                <Pressable style={styles.addBtn} onPress={handleAddVideo} disabled={busy}>
                  {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Add video</Text>}
                </Pressable>
              </View>
              {videos.map((item) => (
                <View key={item.id} style={styles.rowCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowSub}>{item.course} · Google Drive (link hidden)</Text>
                  </View>
                  <Pressable style={styles.previewBtn} onPress={() => onPreviewVideo(item.id)}>
                    <Text style={styles.previewText}>Play</Text>
                  </Pressable>
                  <Pressable style={styles.removeBtn} onPress={() => confirmRemoveMedia(item)}>
                    <Text style={styles.removeText}>Delete</Text>
                  </Pressable>
                </View>
              ))}
              {!videos.length ? <Text style={styles.empty}>No videos yet.</Text> : null}
            </>
          ) : null}

          {tab === 'pdfs' ? (
            <>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Add PDF (Google Drive)</Text>
                <Text style={styles.formSub}>
                  Paste share link. Students view inside the app — no download, no visible URL.
                </Text>
                <Text style={styles.label}>Title</Text>
                <TextInput style={styles.input} placeholder="PDF title" value={pdfTitle} onChangeText={setPdfTitle} />
                <Text style={styles.label}>Course (optional)</Text>
                <TextInput style={styles.input} placeholder="NEET / JEE" value={pdfCourse} onChangeText={setPdfCourse} />
                <Text style={styles.label}>Google Drive link</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={pdfLink}
                  onChangeText={setPdfLink}
                  autoCapitalize="none"
                />
                <Pressable style={styles.addBtn} onPress={handleAddPdf} disabled={busy}>
                  {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Add PDF</Text>}
                </Pressable>
              </View>
              {pdfs.map((item) => (
                <View key={item.id} style={styles.rowCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowSub}>{item.course} · Google Drive (link hidden)</Text>
                  </View>
                  <Pressable style={styles.previewBtn} onPress={() => onPreviewPdf(item.id)}>
                    <Text style={styles.previewText}>Open</Text>
                  </Pressable>
                  <Pressable style={styles.removeBtn} onPress={() => confirmRemoveMedia(item)}>
                    <Text style={styles.removeText}>Delete</Text>
                  </Pressable>
                </View>
              ))}
              {!pdfs.length ? <Text style={styles.empty}>No PDFs yet.</Text> : null}
            </>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function TabChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0fdfa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccfbf1'
  },
  brand: { fontSize: 20, fontWeight: '900', color: '#0f766e' },
  adminName: { fontSize: 13, color: '#64748b', marginTop: 4 },
  signOutBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  signOutText: { color: '#dc2626', fontWeight: '700', fontSize: 13 },
  tabs: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: '#fff' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f1f5f9'
  },
  chipActive: { backgroundColor: '#0f766e' },
  chipText: { fontWeight: '700', fontSize: 13, color: '#64748b' },
  chipTextActive: { color: '#fff' },
  scroll: { padding: 16, paddingBottom: 32, gap: 10 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#99f6e4',
    marginBottom: 8
  },
  formTitle: { fontSize: 18, fontWeight: '800', color: '#134e4a' },
  formSub: { fontSize: 13, color: '#64748b', marginTop: 6, marginBottom: 16, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 15
  },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  prefix: { fontWeight: '700', color: '#334155', fontSize: 16 },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 17,
    letterSpacing: 1
  },
  addBtn: { backgroundColor: '#0f766e', borderRadius: 12, padding: 14, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  rowTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  rowSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  rowMeta: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  previewBtn: { backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  previewText: { color: '#4f46e5', fontWeight: '700', fontSize: 12 },
  removeBtn: { backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  removeText: { color: '#dc2626', fontWeight: '700', fontSize: 12 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 16, fontSize: 14 }
});
