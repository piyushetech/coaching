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
  onSendOtp: (mobile: string) => Promise<{ error?: string; devOtp?: string }>;
  onVerifyOtp: (mobile: string, otp: string) => Promise<string | null>;
};

export function OtpLoginForm({ title, subtitle, accent, hint, onSendOtp, onVerifyOtp }: Props) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [busy, setBusy] = useState(false);

  function normalizeInput(value: string) {
    return value.replace(/\D/g, '').slice(0, 10);
  }

  async function handleSendOtp() {
    const digits = normalizeInput(mobile);
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setBusy(true);
    setError('');
    setInfo('');
    setDevOtp('');
    try {
      const res = await onSendOtp(digits);
      if (res.error) {
        setError(res.error);
        return;
      }
      setMobile(digits);
      setStep('otp');
      setInfo('OTP sent! Check your SMS.');
      if (res.devOtp) {
        setDevOtp(res.devOtp);
        setInfo(`Dev OTP: ${res.devOtp}`);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify() {
    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Enter the 6-digit OTP.');
      return;
    }
    setBusy(true);
    setError('');
    const err = await onVerifyOtp(mobile, otp.trim());
    if (err) setError(err);
    setBusy(false);
  }

  function changeNumber() {
    setStep('mobile');
    setOtp('');
    setError('');
    setInfo('');
    setDevOtp('');
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}>
      <View style={[styles.badge, { backgroundColor: accent }]}>
        <Text style={styles.badgeText}>{title}</Text>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {__DEV__ ? <Text style={styles.devApi}>API: {API_URL}</Text> : null}

      {step === 'mobile' ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Mobile number (10 digits)"
            keyboardType="phone-pad"
            maxLength={10}
            value={mobile}
            onChangeText={(v) => setMobile(normalizeInput(v))}
          />
          <Pressable style={[styles.button, { backgroundColor: accent }]} onPress={handleSendOtp} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.mobileLabel}>+91 {mobile}</Text>
          <Pressable onPress={changeNumber}>
            <Text style={styles.changeLink}>Change number</Text>
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="6-digit OTP"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
          />
          {devOtp ? (
            <Pressable style={styles.devFill} onPress={() => setOtp(devOtp)}>
              <Text style={styles.devFillText}>Tap to fill dev OTP: {devOtp}</Text>
            </Pressable>
          ) : null}
          <Pressable style={[styles.button, { backgroundColor: accent }]} onPress={handleVerify} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Sign in</Text>}
          </Pressable>
          <Pressable style={styles.resendBtn} onPress={handleSendOtp} disabled={busy}>
            <Text style={styles.resendText}>Resend OTP</Text>
          </Pressable>
        </>
      )}

      {info ? <Text style={styles.info}>{info}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
    fontSize: 18,
    backgroundColor: '#fff',
    letterSpacing: 1
  },
  mobileLabel: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  changeLink: { color: '#4f46e5', fontWeight: '600', marginBottom: 16, fontSize: 13 },
  button: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  resendBtn: { marginTop: 14, alignItems: 'center' },
  resendText: { color: '#64748b', fontWeight: '600' },
  devFill: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  devFillText: { color: '#92400e', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  info: { color: '#059669', marginTop: 12, fontSize: 14 },
  error: { color: '#dc2626', marginTop: 12, fontSize: 14 }
});
