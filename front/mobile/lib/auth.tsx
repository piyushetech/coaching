import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import {
  clearSession,
  fetchCurrentUser,
  fetchCourses,
  fetchStorageStats,
  filterMediaForUser,
  fetchMedia,
  getStoredUser,
  getToken,
  isOwnerUser,
  sendOtp,
  verifyOtp,
  purgeLegacySession,
  saveSession,
  setUnauthorizedHandler
} from './api';
import type { AppUser, CourseOption, MediaItem, StorageStats } from './types';

type Portal = 'student' | 'admin';

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  media: MediaItem[];
  storage: StorageStats | null;
  courses: CourseOption[];
  refreshMedia: () => Promise<void>;
  refreshUser: () => Promise<void>;
  signInWithOtp: (portal: Portal, mobile: string, otp: string) => Promise<string | null>;
  requestOtp: (mobile: string) => Promise<{ error?: string; devOtp?: string }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isOwner: boolean;
  isStudent: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [storage, setStorage] = useState<StorageStats | null>(null);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
    setMedia([]);
    setStorage(null);
    router.replace('/');
  }, []);

  const refreshMedia = useCallback(async () => {
    const currentUser = await getStoredUser();
    if (!currentUser || !(await getToken())) {
      setMedia([]);
      setStorage(null);
      return;
    }
    try {
      const [list, courseList] = await Promise.all([fetchMedia(), fetchCourses().catch(() => [])]);
      setCourses(courseList);
      setMedia(filterMediaForUser(list, currentUser));
      if (isOwnerUser(currentUser)) {
        const stats = await fetchStorageStats();
        setStorage(stats);
      } else {
        setStorage(null);
      }
    } catch {
      setMedia([]);
      setStorage(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      await signOut();
      return;
    }
    try {
      const fresh = await fetchCurrentUser();
      if (fresh) {
        await saveSession(fresh, token);
        setUser(fresh);
        await refreshMedia();
      }
    } catch {
      await signOut();
    }
  }, [refreshMedia, signOut]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  useEffect(() => {
    (async () => {
      await purgeLegacySession();
      const stored = await getStoredUser();
      const token = await getToken();
      if (stored && token) {
        setUser(stored);
        try {
          const fresh = await fetchCurrentUser();
          if (fresh) {
            await saveSession(fresh, token);
            setUser(fresh);
          }
        } catch {
          await clearSession();
          setUser(null);
          setLoading(false);
          return;
        }
        await refreshMedia();
      }
      setLoading(false);
    })();
  }, [refreshMedia]);

  const requestOtp = useCallback(async (mobile: string) => {
    const res = await sendOtp(mobile);
    if (!res.success) {
      return { error: res.message || 'Could not send OTP.' };
    }
    return { devOtp: res.devOtp };
  }, []);

  const signInWithOtp = useCallback(async (portal: Portal, mobile: string, otp: string) => {
    const res = await verifyOtp(mobile, otp, portal);
    if (!res.success || !res.token || !res.user) {
      return res.message || 'Invalid OTP.';
    }
    await saveSession(res.user, res.token);
    setUser(res.user);
    void refreshMedia();
    return null;
  }, [refreshMedia]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      media,
      storage,
      courses,
      refreshMedia,
      refreshUser,
      signInWithOtp,
      requestOtp,
      signOut,
      isAdmin: user?.role === 'admin',
      isOwner: isOwnerUser(user),
      isStudent: user?.role === 'student'
    }),
    [user, loading, media, storage, courses, refreshMedia, refreshUser, signInWithOtp, requestOtp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
