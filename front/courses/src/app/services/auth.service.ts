import { Injectable, NgZone, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CourseId } from '../constants/courses';
import { ApiService } from './api.service';

export type UserRole = 'admin' | 'student';

export interface UserProfile {
  mobile?: string;
  address?: string;
  education?: string;
  educationMarks?: string;
  avatarUrl?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isOwner?: boolean;
  courses?: CourseId[];
  profile?: UserProfile;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  mobile?: string;
  address?: string;
  education?: string;
  educationMarks?: string;
  courses?: CourseId[];
}

export interface AuthResult {
  success: boolean;
  message?: string;
  token?: string;
  user?: AppUser;
  errorType?: 'credentials' | 'wrong_portal' | 'network';
  portalHint?: 'admin' | 'student';
}

const STORAGE_TOKEN = 'sankalp_token';
const STORAGE_USER = 'sankalp_user';
const LOGOUT_KEY = 'sankalp_logout';

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AppUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private ngZone = inject(NgZone);
  private router = inject(Router);

  /** Bumps when user profile/avatar changes so header can refresh. */
  readonly userRev = signal(0);

  private touchUser() {
    this.userRev.update((v) => v + 1);
  }

  constructor() {
    this.purgeLegacySession();
    window.addEventListener('storage', (ev: StorageEvent) => {
      if (!ev) return;
      if (ev.key === STORAGE_TOKEN && ev.newValue === null) {
        this.ngZone.run(() => this.router.navigateByUrl('/student/login'));
      }
      if (ev.key === LOGOUT_KEY) {
        localStorage.removeItem(STORAGE_TOKEN);
        localStorage.removeItem(STORAGE_USER);
        this.ngZone.run(() => this.router.navigateByUrl('/student/login'));
      }
    });
  }

  getUserCourses(user: AppUser | null = this.getUser()): CourseId[] {
    if (!user) return [];
    if (this.isOwnerUser(user)) return [];
    return user.courses ?? [];
  }

  canAccessCourse(course: CourseId, user: AppUser | null = this.getUser()): boolean {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (this.isOwnerUser(user)) return true;
    return (user.courses ?? []).includes(course);
  }

  isOwnerUser(user: AppUser): boolean {
    return !!user.isOwner || user.email.toLowerCase() === 'owner@sankalp.com';
  }

  async getAllUsers(): Promise<AppUser[]> {
    try {
      return await firstValueFrom(this.api.get<AppUser[]>('/users'));
    } catch {
      return [];
    }
  }

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const res = await firstValueFrom(this.api.post<AuthResponse>('/auth/login', { email, password }, 8000));
      if (res.success && res.token && res.user) {
        this.setSession(res.user, res.token);
      }
      return res;
    } catch (err: unknown) {
      return this.loginHttpError(err);
    }
  }

  async loginAsStudent(email: string, password: string): Promise<AuthResult> {
    const res = await this.login(email, password);
    if (!res.success) return res;
    if (!this.isStudent()) {
      this.logout();
      return {
        success: false,
        errorType: 'wrong_portal',
        portalHint: 'admin',
        message: 'You have an admin account. Students cannot sign in from this page.'
      };
    }
    return res;
  }

  async loginAsAdmin(email: string, password: string): Promise<AuthResult> {
    const res = await this.login(email, password);
    if (!res.success) return res;
    if (!this.isAdmin()) {
      this.logout();
      return {
        success: false,
        errorType: 'wrong_portal',
        portalHint: 'student',
        message: 'You have a student account. Admins cannot sign in from this page.'
      };
    }
    return res;
  }

  isOwner(): boolean {
    const user = this.getUser();
    return !!user && user.role === 'admin' && this.isOwnerUser(user);
  }

  async createUser(input: CreateUserInput, role: UserRole): Promise<AuthResult> {
    try {
      return await firstValueFrom(this.api.post<AuthResult>('/users', { ...input, role }));
    } catch (err: unknown) {
      return this.httpError(err);
    }
  }

  async register(name: string, email: string, password: string, courses: CourseId[] = []): Promise<AuthResult> {
    try {
      const res = await firstValueFrom(
        this.api.post<AuthResponse>('/auth/register', { name, email, password, courses }, 8000)
      );
      if (res.success && res.token && res.user) {
        this.setSession(res.user, res.token);
      }
      return res;
    } catch (err: unknown) {
      return this.httpError(err);
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<AuthResult> {
    try {
      const res = await firstValueFrom(this.api.patch<AuthResponse>('/auth/profile', updates));
      if (res.success && res.user) {
        localStorage.setItem(STORAGE_USER, JSON.stringify(res.user));
        this.touchUser();
      }
      return res;
    } catch (err: unknown) {
      return this.httpError(err);
    }
  }

  async uploadProfileAvatar(file: File): Promise<AuthResult> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await firstValueFrom(this.api.upload<AuthResponse>('/auth/profile/avatar', formData));
      if (res.success && res.user) {
        localStorage.setItem(STORAGE_USER, JSON.stringify(res.user));
        this.touchUser();
      }
      return res;
    } catch (err: unknown) {
      return this.httpError(err);
    }
  }

  async removeProfileAvatar(): Promise<AuthResult> {
    try {
      const res = await firstValueFrom(this.api.delete<AuthResponse>('/auth/profile/avatar'));
      if (res.success && res.user) {
        localStorage.setItem(STORAGE_USER, JSON.stringify(res.user));
        this.touchUser();
      }
      return res;
    } catch (err: unknown) {
      return this.httpError(err);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      return await firstValueFrom(this.api.patch<AuthResult>('/auth/password', { currentPassword, newPassword }));
    } catch (err: unknown) {
      return this.httpError(err);
    }
  }

  async updateUserCourses(userId: string, courses: CourseId[]): Promise<boolean> {
    try {
      const res = await firstValueFrom(this.api.patch<{ user: AppUser }>(`/users/${userId}/courses`, { courses }));
      if (this.getUser()?.id === userId && res.user) {
        localStorage.setItem(STORAGE_USER, JSON.stringify(res.user));
      }
      return true;
    } catch {
      return false;
    }
  }

  async updateStudentByAdmin(
    userId: string,
    updates: { email?: string; mobile?: string }
  ): Promise<AuthResult> {
    try {
      return await firstValueFrom(this.api.patch<AuthResult>(`/users/${userId}`, updates));
    } catch (err: unknown) {
      return this.httpError(err);
    }
  }

  async updateUserByAdmin(
    userId: string,
    updates: { name?: string; email?: string; mobile?: string }
  ): Promise<AuthResult> {
    try {
      return await firstValueFrom(this.api.patch<AuthResult>(`/users/${userId}`, updates));
    } catch (err: unknown) {
      return this.httpError(err);
    }
  }

  async deleteUser(userId: string): Promise<AuthResult> {
    try {
      return await firstValueFrom(this.api.delete<AuthResult>(`/users/${userId}`));
    } catch (err: unknown) {
      return this.httpError(err);
    }
  }

  async forgotPassword(email: string): Promise<AuthResult> {
    try {
      return await firstValueFrom(this.api.post<AuthResult>('/auth/forgot-password', { email }));
    } catch (err: unknown) {
      return this.httpError(err);
    }
  }

  async refreshCurrentUser(): Promise<void> {
    if (!this.getToken()) return;
    try {
      const res = await firstValueFrom(this.api.get<{ user: AppUser }>('/auth/me'));
      if (res.user) {
        localStorage.setItem(STORAGE_USER, JSON.stringify(res.user));
        this.touchUser();
      }
    } catch {
      this.handleUnauthorized();
    }
  }

  private setSession(user: AppUser, token: string) {
    localStorage.setItem(STORAGE_TOKEN, token);
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    this.touchUser();
  }

  getUser(): AppUser | null {
    const v = localStorage.getItem(STORAGE_USER);
    return v ? JSON.parse(v) : null;
  }

  isAdmin(): boolean {
    return this.getUser()?.role === 'admin';
  }

  isStudent(): boolean {
    return this.getUser()?.role === 'student';
  }

  logout() {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    try {
      localStorage.setItem(LOGOUT_KEY, Date.now().toString());
    } catch { /* ignore */ }
  }

  getToken(): string | null {
    const token = localStorage.getItem(STORAGE_TOKEN);
    return token && this.isValidToken(token) ? token : null;
  }

  /** Reject old localStorage mock tokens; only real JWTs are accepted */
  isValidToken(token: string | null = localStorage.getItem(STORAGE_TOKEN)): boolean {
    if (!token) return false;
    if (token.startsWith('mock-token')) return false;
    const parts = token.split('.');
    return parts.length === 3 && parts.every((p) => p.length > 0);
  }

  purgeLegacySession() {
    const token = localStorage.getItem(STORAGE_TOKEN);
    if (token && !this.isValidToken(token)) {
      this.logout();
    }
  }

  handleUnauthorized() {
    const wasAdmin = this.isAdmin();
    this.logout();
    const path = wasAdmin ? '/admin/login' : '/student/login';
    this.ngZone.run(() => this.router.navigateByUrl(path));
  }

  private loginHttpError(err: unknown): AuthResult {
    const e = err as { status?: number; error?: { message?: string }; message?: string };
    if (e.status === 401) {
      return {
        success: false,
        errorType: 'credentials',
        message: e.error?.message || 'Incorrect email or password. Please check your username and password.'
      };
    }
    if (e.status === 502 || e.status === 503 || e.status === 504) {
      return {
        success: false,
        errorType: 'network',
        message: 'Cannot reach the server. Please ensure the backend is running on port 4000.'
      };
    }
    if (e.status === 0 || e.message?.includes('timed out')) {
      return {
        success: false,
        errorType: 'network',
        message: e.error?.message || e.message || 'Could not reach the server. Please try again.'
      };
    }
    return {
      success: false,
      errorType: 'credentials',
      message: e.error?.message || e.message || 'Login failed. Please try again.'
    };
  }

  private httpError(err: unknown, fallback = 'Request failed'): AuthResult {
    const e = err as { error?: { message?: string }; message?: string };
    return { success: false, message: e.error?.message || e.message || fallback };
  }
}
