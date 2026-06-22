export type LoginPortal = 'student' | 'admin';

export type SavedCredentials = {
  email: string;
  password: string;
};

const KEYS: Record<LoginPortal, string> = {
  student: 'sankalp_saved_student',
  admin: 'sankalp_saved_admin'
};

export function loadSavedCredentials(portal: LoginPortal): SavedCredentials | null {
  try {
    const raw = localStorage.getItem(KEYS[portal]);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedCredentials;
    if (parsed?.email && parsed?.password) return parsed;
  } catch { /* ignore */ }
  return null;
}

export function saveCredentials(portal: LoginPortal, email: string, password: string) {
  localStorage.setItem(KEYS[portal], JSON.stringify({ email, password }));
}

export function clearSavedCredentials(portal: LoginPortal) {
  localStorage.removeItem(KEYS[portal]);
}
