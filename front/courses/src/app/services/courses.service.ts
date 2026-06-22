import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { CourseOption, DEFAULT_COURSES } from '../constants/courses';

interface CourseResult {
  success: boolean;
  message?: string;
  course?: CourseOption;
}

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private api = inject(ApiService);
  private list = signal<CourseOption[]>([...DEFAULT_COURSES]);

  readonly courses = this.list.asReadonly();

  async load(): Promise<CourseOption[]> {
    try {
      const items = await firstValueFrom(this.api.get<CourseOption[]>('/courses'));
      if (items?.length) {
        this.list.set(items);
      }
    } catch {
      /* keep defaults for offline / register page */
    }
    return this.list();
  }

  label(id: string | undefined | null): string {
    if (!id) return '—';
    return this.list().find((c) => c.id === id)?.label ?? id;
  }

  labels(ids: string[] | undefined): string {
    if (!ids?.length) return '—';
    return ids.map((id) => this.label(id)).join(', ');
  }

  async addCourse(label: string): Promise<CourseResult> {
    try {
      const res = await firstValueFrom(this.api.post<CourseResult>('/courses', { label }));
      if (res.success) await this.load();
      return res;
    } catch (err: unknown) {
      return this.httpError(err);
    }
  }

  async deleteCourse(id: string): Promise<CourseResult> {
    try {
      const res = await firstValueFrom(this.api.delete<CourseResult>(`/courses/${id}`));
      if (res.success) await this.load();
      return res;
    } catch (err: unknown) {
      return this.httpError(err);
    }
  }

  private httpError(err: unknown): CourseResult {
    const e = err as { error?: { message?: string }; message?: string };
    return { success: false, message: e.error?.message || e.message || 'Request failed' };
  }
}
