import { API_URL } from './config';

export type SendOtpResult = {
  success: boolean;
  message?: string;
  devOtp?: string;
};

export type VerifyOtpResult = {
  success: boolean;
  message?: string;
  token?: string;
  user?: { id: string; name: string; email: string; role: string };
};

export async function sendOtp(mobile: string): Promise<SendOtpResult> {
  try {
    const res = await fetch(`${API_URL}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ mobile })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, message: data.message || 'Could not send OTP.' };
    }
    return { success: true, message: data.message, devOtp: data.devOtp };
  } catch {
    return {
      success: false,
      message: `Cannot reach server at ${API_URL}. Start the backend and check EXPO_PUBLIC_API_URL.`
    };
  }
}

export async function verifyOtp(mobile: string, otp: string): Promise<VerifyOtpResult> {
  try {
    const res = await fetch(`${API_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ mobile, otp, portal: 'student' })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, message: data.message || 'Invalid OTP.' };
    }
    return {
      success: true,
      token: data.token,
      user: data.user,
      message: data.message
    };
  } catch {
    return { success: false, message: 'Network error. Try again.' };
  }
}
