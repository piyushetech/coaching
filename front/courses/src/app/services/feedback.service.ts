import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppUser } from './auth.service';
import { ApiService } from './api.service';

export type TeacherRating = {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  rating: number;
  comment?: string;
  date: string;
};

export type StudentFeedback = {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  message: string;
  date: string;
};

export type TeacherAppreciation = {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  message: string;
  date: string;
};

export type TeacherRatingSummary = {
  teacher: AppUser;
  count: number;
  average: number;
  ratings: TeacherRating[];
};

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private api = inject(ApiService);

  async getTeachers(): Promise<AppUser[]> {
    return firstValueFrom(this.api.get<AppUser[]>('/feedback/teachers'));
  }

  async submitRating(teacherId: string, rating: number, comment?: string): Promise<{ success: boolean; message?: string }> {
    try {
      return await firstValueFrom(this.api.post<{ success: boolean; message?: string }>('/feedback/ratings', {
        teacherId,
        rating,
        comment
      }));
    } catch (err: unknown) {
      const e = err as { error?: { message?: string } };
      return { success: false, message: e.error?.message || 'Could not submit rating' };
    }
  }

  async getMyRatingForTeacher(teacherId: string): Promise<TeacherRating | null> {
    return firstValueFrom(this.api.get<TeacherRating | null>(`/feedback/ratings/my/${teacherId}`));
  }

  async getTeacherRatingSummaries(): Promise<TeacherRatingSummary[]> {
    try {
      return await firstValueFrom(this.api.get<TeacherRatingSummary[]>('/feedback/ratings/summary'));
    } catch {
      return [];
    }
  }

  async addStudentFeedback(
    studentId: string,
    message: string,
    feedbackId?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      return await firstValueFrom(
        this.api.post<{ success: boolean; message?: string }>(`/feedback/student/${studentId}`, { message, feedbackId })
      );
    } catch (err: unknown) {
      const e = err as { error?: { message?: string } };
      return { success: false, message: e.error?.message || 'Could not save feedback' };
    }
  }

  async updateStudentFeedback(feedbackId: string, message: string): Promise<{ success: boolean; message?: string }> {
    try {
      return await firstValueFrom(
        this.api.patch<{ success: boolean; message?: string }>(`/feedback/student/entry/${feedbackId}`, { message })
      );
    } catch (err: unknown) {
      const e = err as { error?: { message?: string } };
      return { success: false, message: e.error?.message || 'Could not update feedback' };
    }
  }

  async getMyFeedbackToStudent(studentId: string): Promise<StudentFeedback[]> {
    return firstValueFrom(this.api.get<StudentFeedback[]>(`/feedback/student/${studentId}/from-me`));
  }

  async getFeedbackForStudent(studentId: string): Promise<StudentFeedback[]> {
    return firstValueFrom(this.api.get<StudentFeedback[]>(`/feedback/student/${studentId}`));
  }

  async getMyFeedback(): Promise<StudentFeedback[]> {
    return firstValueFrom(this.api.get<StudentFeedback[]>('/feedback/my'));
  }

  async submitAppreciation(teacherId: string, message: string): Promise<{ success: boolean; message?: string }> {
    try {
      return await firstValueFrom(
        this.api.post<{ success: boolean; message?: string }>(`/feedback/appreciation/${teacherId}`, { message })
      );
    } catch (err: unknown) {
      const e = err as { error?: { message?: string } };
      return { success: false, message: e.error?.message || 'Could not send appreciation' };
    }
  }

  async getMyAppreciations(): Promise<TeacherAppreciation[]> {
    return firstValueFrom(this.api.get<TeacherAppreciation[]>('/feedback/appreciation/my'));
  }

  async getReceivedAppreciations(): Promise<TeacherAppreciation[]> {
    try {
      return firstValueFrom(this.api.get<TeacherAppreciation[]>('/feedback/appreciation/received'));
    } catch {
      return [];
    }
  }
}
