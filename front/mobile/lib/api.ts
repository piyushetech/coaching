import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';
import type { ExamQuestion, MockExam } from './exam';
import type { AppUser, AuthResponse, CourseOption, MediaItem, StorageStats, ApiResult } from './types';

const TOKEN_KEY = 'sankalp_token';
const USER_KEY = 'sankalp_user';

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function isValidToken(token: string | null): boolean {
  if (!token) return false;
  if (token.startsWith('mock-token')) return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

export async function getToken(): Promise<string | null> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return token && isValidToken(token) ? token : null;
}

export async function getStoredUser(): Promise<AppUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AppUser) : null;
}

export async function saveSession(user: AppUser, token: string) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)]
  ]);
}

export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

export async function purgeLegacySession() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token && !isValidToken(token)) {
    await clearSession();
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>)
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      `Could not reach ${API_URL}. Start the backend (port 4000) and use "npx expo start --lan". ` +
        'On a phone, set EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:4000 in mobile/.env'
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const isAuthRoute =
      path.includes('/auth/login') ||
      path.includes('/auth/register') ||
      path.includes('/auth/forgot-password') ||
      path.includes('/auth/otp/');
    if (res.status === 401 && !isAuthRoute) {
      unauthorizedHandler?.();
    }
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data as T;
}

// — Auth (same as courses web app) —

export async function login(email: string, password: string): Promise<AuthResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  } catch {
    return {
      success: false,
      message:
        `Could not reach ${API_URL}. Start the backend on port 4000 and check EXPO_PUBLIC_API_URL in mobile/.env`
    };
  }

  const data = (await res.json().catch(() => ({}))) as AuthResponse;
  if (!res.ok) {
    return {
      success: false,
      message: data.message || 'Incorrect email or password.'
    };
  }
  return data;
}

export type OtpSendResponse = {
  success: boolean;
  message?: string;
  devOtp?: string;
};

export async function sendOtp(mobile: string): Promise<OtpSendResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/otp/send`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile })
    });
  } catch {
    return {
      success: false,
      message: `Could not reach ${API_URL}. Start the backend on port 4000.`
    };
  }
  const data = (await res.json().catch(() => ({}))) as OtpSendResponse;
  if (!res.ok) {
    return { success: false, message: data.message || 'Could not send OTP.' };
  }
  return data;
}

export async function verifyOtp(
  mobile: string,
  otp: string,
  portal: 'student' | 'admin'
): Promise<AuthResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, portal })
    });
  } catch {
    return {
      success: false,
      message: `Could not reach ${API_URL}. Start the backend on port 4000.`
    };
  }
  const data = (await res.json().catch(() => ({}))) as AuthResponse;
  if (!res.ok) {
    return { success: false, message: data.message || 'Invalid OTP.' };
  }
  return data;
}

export async function fetchCurrentUser(): Promise<AppUser | null> {
  const res = await request<{ user: AppUser }>('/auth/me');
  return res.user ?? null;
}

export async function updateProfile(updates: Partial<AppUser['profile']>): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<ApiResult> {
  return request<ApiResult>('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword })
  });
}

// — Files / media —

export async function fetchMedia(): Promise<MediaItem[]> {
  return request<MediaItem[]>('/files');
}

export async function fetchStorageStats(): Promise<StorageStats> {
  return request<StorageStats>('/files/storage');
}

// — Courses —

export async function fetchCourses(): Promise<CourseOption[]> {
  return request<CourseOption[]>('/courses');
}

// — Access helpers (same logic as courses auth.service.ts) —

export function isOwnerUser(user: AppUser | null): boolean {
  if (!user) return false;
  return !!user.isOwner || user.email.toLowerCase() === 'owner@sankalp.com';
}

export function canAccessCourse(user: AppUser | null, course: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (isOwnerUser(user)) return true;
  return (user.courses ?? []).includes(course);
}

export function filterMediaForUser(items: MediaItem[], user: AppUser | null): MediaItem[] {
  return items.filter((item) => canAccessCourse(user, item.course));
}

export function courseLabel(id: string, courses: CourseOption[]): string {
  return courses.find((c) => c.id === id)?.label ?? id;
}

// — Mock exams —

export async function fetchExams(): Promise<MockExam[]> {
  return request<MockExam[]>('/exams');
}

export async function fetchExamQuestions(examId: string): Promise<ExamQuestion[]> {
  return request<ExamQuestion[]>(`/exams/${examId}/questions`);
}

export async function submitExamAttempt(
  examId: string,
  payload: { score: number; total: number; accuracy: number; timeTaken: string }
): Promise<void> {
  await request(`/exams/${examId}/attempts`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function filterExamsForUser(exams: MockExam[], user: AppUser | null): MockExam[] {
  if (!user) return [];
  if (isOwnerUser(user) || user.role === 'admin') return exams;
  return exams.filter((e) => canAccessCourse(user, e.course));
}
