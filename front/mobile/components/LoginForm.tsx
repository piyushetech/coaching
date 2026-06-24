import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { API_URL } from '@/lib/config';

type Props = {
  title: string;
  subtitle: string;
  accent: string;
  hint?: string;
  defaultEmail?: string;
  onSubmit: (email: string, password: string) => Promise<string | null>;
};

export function LoginForm({ title, subtitle, accent, hint, defaultEmail = '', onSubmit }: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || password.length < 6) {
      setError('Enter email and password (min 6 characters).');
      return;
    }
    setBusy(true);
    setError('');
    const err = await onSubmit(email.trim(), password);
    if (err) setError(err);
    setBusy(false);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}>
      <View style={[styles.badge, { backgroundColor: accent }]}>
        <Text style={styles.badgeText}>{title}</Text>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {__DEV__ ? <Text style={styles.devApi}>API: {API_URL}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={[styles.button, { backgroundColor: accent }]} onPress={handleSubmit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, justifyContent: 'center' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginBottom: 12 },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  subtitle: { color: '#64748b', marginBottom: 8, fontSize: 15 },
  hint: { color: '#94a3b8', marginBottom: 12, fontSize: 13, lineHeight: 18 },
  devApi: { color: '#64748b', fontSize: 11, marginBottom: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  button: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  error: { color: '#dc2626', marginBottom: 8, fontSize: 14 }
});
