import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CourseId } from '../constants/courses';
import { AuthService, AppUser } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import {
  MockExam,
  ExamAttempt,
  ExamQuestion,
  ExamResultSummary,
  StudentPerformanceTier,
  generateQuestions,
  computeResults,
  performanceTier
} from './mock-exam.data';

export type CreateExamInput = {
  title: string;
  examType: string;
  course: CourseId;
  description: string;
  questions?: number;
  durationMinutes?: number;
};

@Injectable({ providedIn: 'root' })
export class MockExamService {
  private auth = inject(AuthService);
  private api = inject(ApiService);

  async getAllExams(): Promise<MockExam[]> {
    return firstValueFrom(this.api.get<MockExam[]>('/exams'));
  }

  async getExamsForUser(user: AppUser | null = this.auth.getUser()): Promise<MockExam[]> {
    const all = await this.getAllExams();
    if (!user) return [];
    if (this.auth.isOwnerUser(user)) return all;
    return all.filter((e) => this.auth.canAccessCourse(e.course, user));
  }

  async createExam(input: CreateExamInput): Promise<MockExam | null> {
    if (!this.auth.isAdmin()) return null;
    try {
      return await firstValueFrom(this.api.post<MockExam>('/exams', input));
    } catch {
      return null;
    }
  }

  async getQuestionsForExam(exam: MockExam): Promise<ExamQuestion[]> {
    try {
      return await firstValueFrom(this.api.get<ExamQuestion[]>(`/exams/${exam.id}/questions`));
    } catch {
      return generateQuestions(exam.id, exam.questions);
    }
  }

  scoreExam(
    questions: ExamQuestion[],
    answers: Record<string, number>,
    timeSpentSeconds: number
  ): ExamResultSummary {
    return computeResults(questions, answers, timeSpentSeconds);
  }

  async saveAttempt(exam: MockExam, results: ExamResultSummary): Promise<ExamAttempt | null> {
    if (!this.auth.isStudent()) return null;
    try {
      return await firstValueFrom(this.api.post<ExamAttempt>(`/exams/${exam.id}/attempts`, {
        score: results.score,
        total: results.total,
        accuracy: results.accuracy,
        timeTaken: results.timeSpentLabel
      }));
    } catch {
      return null;
    }
  }

  async getAttemptsForStudent(studentId: string): Promise<ExamAttempt[]> {
    return firstValueFrom(this.api.get<ExamAttempt[]>(`/exams/attempts/student/${studentId}`));
  }

  async getStudentPerformance(studentId: string): Promise<{ avg: number | null; tier: StudentPerformanceTier; attempts: number }> {
    try {
      return await firstValueFrom(this.api.get<{ avg: number | null; tier: StudentPerformanceTier; attempts: number }>(
        `/exams/attempts/performance/${studentId}`
      ));
    } catch {
      return { avg: null, tier: 'none', attempts: 0 };
    }
  }
}
