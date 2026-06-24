import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatAccessDate, type AccessStatus } from '../lib/accessStore';
import type { AuthUser } from '../lib/dummyAuth';

type Props = {
  user: AuthUser;
  access: AccessStatus;
  videoCount: number;
  pdfCount: number;
  onSignOut: () => void;
};

export function ProfileTab({ user, access, videoCount, pdfCount, onSignOut }: Props) {
  const hasAccess = access.state === 'active';

  return (
    <View style={styles.wrap}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.mobile}>+91 {user.mobile}</Text>

      <View style={[styles.accessCard, hasAccess ? styles.accessActive : styles.accessInactive]}>
        <Text style={styles.accessTitle}>{hasAccess ? '✓ Access active' : '✗ No access'}</Text>
        {access.state === 'active' ? (
          <Text style={styles.accessDetail}>
            Valid until {formatAccessDate(access.grant.expiresAt)}
          </Text>
        ) : null}
        {access.state === 'expired' ? (
          <Text style={styles.accessDetail}>
            Expired on {formatAccessDate(access.grant.expiresAt)}. Contact admin to renew.
          </Text>
        ) : null}
        {access.state === 'none' ? (
          <Text style={styles.accessDetail}>Ask admin to add your mobile number.</Text>
        ) : null}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{videoCount}</Text>
          <Text style={styles.statLabel}>Videos</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{pdfCount}</Text>
          <Text style={styles.statLabel}>PDFs</Text>
        </View>
      </View>

      <Pressable style={styles.signOut} onPress={onSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', padding: 24, paddingTop: 32 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  name: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  mobile: { fontSize: 15, color: '#64748b', marginTop: 4, marginBottom: 20 },
  accessCard: {
    width: '100%',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24
  },
  accessActive: { backgroundColor: '#dcfce7' },
  accessInactive: { backgroundColor: '#fee2e2' },
  accessTitle: { fontWeight: '800', fontSize: 15, color: '#0f172a' },
  accessDetail: { fontSize: 13, color: '#475569', marginTop: 6, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 28 },
  stat: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  statNum: { fontSize: 28, fontWeight: '900', color: '#4f46e5' },
  statLabel: { fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: '600' },
  signOut: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40
  },
  signOutText: { color: '#fff', fontWeight: '800', fontSize: 15 }
});
