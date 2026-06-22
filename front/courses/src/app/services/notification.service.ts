import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService, AppUser } from './auth.service';
import { CourseId } from '../constants/courses';
import { ApiService } from './api.service';

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'alert';
  targetRole?: 'student' | 'admin' | 'all';
  targetCourses?: CourseId[];
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private items = signal<NotificationItem[]>([]);

  readonly notifications = computed(() => this.filterForCurrentUser(this.items()));
  unreadCount = computed(() => this.notifications().filter((n) => !n.read).length);

  async load(): Promise<void> {
    if (!this.auth.getToken()) {
      this.items.set([]);
      return;
    }
    try {
      const list = await firstValueFrom(this.api.get<NotificationItem[]>('/notifications'));
      this.items.set(list);
    } catch {
      this.items.set([]);
    }
  }

  private filterForCurrentUser(list: NotificationItem[]): NotificationItem[] {
    const user = this.auth.getUser();
    if (!user) return [];
    return list.filter((n) => this.isVisibleToUser(n, user));
  }

  private isVisibleToUser(n: NotificationItem, user: AppUser): boolean {
    const role = n.targetRole ?? 'all';
    if (role === 'all') return true;
    if (role === 'student' && user.role !== 'student') return false;
    if (role === 'admin' && user.role !== 'admin') return false;
    if (n.targetCourses?.length) {
      if (this.auth.isOwnerUser(user)) return true;
      const userCourses = user.courses ?? [];
      return n.targetCourses.some((c) => userCourses.includes(c));
    }
    return true;
  }

  async markRead(id: string): Promise<void> {
    await firstValueFrom(this.api.patch(`/notifications/${id}/read`, {}));
    this.items.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async markAllRead(): Promise<void> {
    await firstValueFrom(this.api.patch('/notifications/read-all', {}));
    const visibleIds = new Set(this.notifications().map((n) => n.id));
    this.items.update((list) => list.map((n) => (visibleIds.has(n.id) ? { ...n, read: true } : n)));
  }
}
