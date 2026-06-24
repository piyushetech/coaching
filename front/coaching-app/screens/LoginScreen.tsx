import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendDummyOtp, verifyAdminOtp, verifyStudentOtp, type AuthUser, type UserRole } from '../lib/dummyAuth';

type Props = {
  role: UserRole;
  onLogin: (user: AuthUser) => void;
  onBack: () => void;
};

type Step = 'mobile' | 'otp';

export function LoginScreen({ role, onLogin, onBack }: Props) {
  const [step, setStep] = useState<Step>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [devOtp, setDevOtp] = useState('');

  function normalizeMobile(value: string) {
    return value.replace(/\D/g, '').slice(0, 10);
  }

  async function handleSendOtp() {
    const digits = normalizeMobile(mobile);
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    setBusy(true);
    setError('');
    setInfo('');
    setDevOtp('');

    const res = await sendDummyOtp(digits);
    setBusy(false);

    if (!res.success) {
      setError(res.message || 'Could not send OTP.');
      return;
    }

    setMobile(digits);
    setStep('otp');
    setInfo(res.message || 'OTP sent to your mobile number.');
    if (res.devOtp) {
      setDevOtp(res.devOtp);
      setInfo(`Dev OTP: ${res.devOtp}`);
    }
  }

  const accent = role === 'admin' ? '#0f766e' : '#4f46e5';
  const portalLabel = role === 'admin' ? 'Admin Portal' : 'Student Portal';

  async function handleVerifyOtp() {
    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Enter the 6-digit OTP.');
      return;
    }

    setBusy(true);
    setError('');

    const res =
      role === 'admin'
        ? await verifyAdminOtp(mobile, otp.trim())
        : await verifyStudentOtp(mobile, otp.trim());
    setBusy(false);

    if (!res.success || !res.user) {
      setError(res.message || 'Invalid OTP.');
      return;
    }

    onLogin(res.user);
  }

  function goBackToMobile() {
    setStep('mobile');
    setOtp('');
    setError('');
    setInfo('');
    setDevOtp('');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable onPress={onBack} style={styles.backLink}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
            <View style={[styles.logoCircle, { backgroundColor: accent }]}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.brand}>Sankalp Coaching</Text>
            <Text style={styles.tagline}>{portalLabel}</Text>
          </View>

          <View style={styles.card}>
            {step === 'mobile' ? (
              <>
                <Text style={styles.cardTitle}>Login</Text>
                <Text style={styles.cardSub}>
                  Enter your registered mobile number. We will send a one-time password (OTP).
                </Text>

                <Text style={styles.label}>Mobile number</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.prefix}>
                    <Text style={styles.prefixText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="9876543210"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={mobile}
                    onChangeText={(v) => setMobile(normalizeMobile(v))}
                    editable={!busy}
                    autoFocus
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: accent },
                    pressed && styles.buttonPressed,
                    busy && styles.buttonDisabled
                  ]}
                  onPress={handleSendOtp}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                  )}
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>Enter OTP</Text>
                <Text style={styles.cardSub}>
                  Code sent to <Text style={styles.bold}>+91 {mobile}</Text>
                </Text>
                <Pressable onPress={goBackToMobile}>
                  <Text style={styles.link}>Change number</Text>
                </Pressable>

                <Text style={styles.label}>6-digit OTP</Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="• • • • • •"
                  placeholderTextColor="#94a3b8"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
                  editable={!busy}
                  autoFocus
                />

                {devOtp ? (
                  <Pressable style={styles.devBox} onPress={() => setOtp(devOtp)}>
                    <Text style={styles.devText}>Tap to fill dev OTP: {devOtp}</Text>
                  </Pressable>
                ) : null}

                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: accent },
                    pressed && styles.buttonPressed,
                    busy && styles.buttonDisabled
                  ]}
                  onPress={handleVerifyOtp}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Verify & Login</Text>
                  )}
                </Pressable>

                <Pressable style={styles.secondaryBtn} onPress={handleSendOtp} disabled={busy}>
                  <Text style={styles.secondaryText}>Resend OTP</Text>
                </Pressable>
              </>
            )}

            {info ? <Text style={styles.info}>{info}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <Text style={styles.footer}>
            Demo OTP: <Text style={styles.bold}>123456</Text>
            {role === 'admin' ? (
              <Text> · Admin mobiles: 7619548975, 9999888877</Text>
            ) : (
              <Text> · Admin must add your mobile for video/PDF access</Text>
            )}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eef2ff' },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 28
  },
  backLink: { alignSelf: 'flex-start', marginBottom: 12 },
  backText: { color: '#4f46e5', fontWeight: '700', fontSize: 15 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8
  },
  logoText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900'
  },
  brand: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1e1b4b',
    marginBottom: 6
  },
  tagline: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8
  },
  cardSub: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 20
  },
  bold: { fontWeight: '700', color: '#334155' },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10
  },
  prefix: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155'
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    letterSpacing: 1,
    backgroundColor: '#fafafa'
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 8,
    textAlign: 'center',
    backgroundColor: '#fafafa',
    marginBottom: 16
  },
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4
  },
  buttonPressed: { opacity: 0.9 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16
  },
  secondaryBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8
  },
  secondaryText: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 14
  },
  link: {
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 16
  },
  devBox: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12
  },
  devText: {
    color: '#92400e',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center'
  },
  info: {
    color: '#059669',
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20
  },
  error: {
    color: '#dc2626',
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20
  },
  footer: {
    marginTop: 24,
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12
  },
  apiHint: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 11,
    color: '#cbd5e1'
  }
});
