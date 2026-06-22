import {
  Component,
  signal,
  computed,
  OnDestroy,
  inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MockExamService, CreateExamInput } from './mock-exam.service';
import {
  MockExam,
  ExamQuestion,
  ExamResultSummary,
  EXAM_TYPES,
  COURSE_ICONS,
  CATEGORY_CLASS,
  groupExamsByCourse,
  formatTime
} from './mock-exam.data';
import { CourseId } from '../constants/courses';
import { CoursesService } from '../services/courses.service';

type Screen = 'select' | 'exam' | 'results';

@Component({
  selector: 'app-mock-exam',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './mock-exam.component.html',
  styleUrls: ['./mock-exam.component.css']
})
export class MockExamComponent implements OnInit, OnDestroy {
  private examService = inject(MockExamService);
  private auth = inject(AuthService);
  private coursesService = inject(CoursesService);
  router = inject(Router);

  screen = signal<Screen>('select');
  activeExam = signal<MockExam | null>(null);
  questions = signal<ExamQuestion[]>([]);
  examResults = signal<ExamResultSummary | null>(null);
  availableExams = signal<MockExam[]>([]);

  showCreateDialog = signal(false);
  creatingExam = signal(false);
  createError = signal('');
  newExam: CreateExamInput = {
    title: '',
    examType: 'JEE',
    course: 'jee',
    description: '',
    questions: 50,
    durationMinutes: 60
  };

  currentIndex = signal(0);
  answers = signal<Record<string, number>>({});
  visited = signal<Set<string>>(new Set());
  timeLeft = signal(0);
  showSubmitConfirm = signal(false);
  expandedReviewId = signal<string | null>(null);
  showReview = signal(false);

  courseOptions = this.coursesService.courses;
  examTypes = EXAM_TYPES;
  courseIcons = COURSE_ICONS;
  categoryClass = CATEGORY_CLASS;
  courseLabel = (id: CourseId) => this.coursesService.label(id);

  isAdmin = computed(() => this.auth.isAdmin());
  isStudent = computed(() => this.auth.isStudent());

  examGroups = computed(() => groupExamsByCourse(this.availableExams()));
  examCourseKeys = computed(() => Object.keys(this.examGroups()) as CourseId[]);

  adminCourseOptions = computed(() => {
    const user = this.auth.getUser();
    const all = this.coursesService.courses();
    if (!user) return [];
    if (this.auth.isOwnerUser(user)) return all;
    return all.filter((c) => this.auth.canAccessCourse(c.id, user));
  });

  currentQuestion = computed(() => this.questions()[this.currentIndex()] ?? null);
  answeredCount = computed(() => Object.keys(this.answers()).length);
  reviewCorrect = computed(() => this.examResults()?.review.filter((r) => r.isCorrect).length ?? 0);
  reviewWrong = computed(() => this.examResults()?.review.filter((r) => !r.isCorrect && !r.isSkipped).length ?? 0);
  reviewSkipped = computed(() => this.examResults()?.review.filter((r) => r.isSkipped).length ?? 0);
  passed = computed(() => (this.examResults()?.accuracy ?? 0) >= 60);

  private timerId: ReturnType<typeof setInterval> | null = null;
  private submitted = false;
  private totalSeconds = 0;

  get userName() {
    return this.auth.getUser()?.name ?? 'Student';
  }

  ngOnInit() {
    void this.coursesService.load();
    this.loadExams();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  loadExams() {
    this.examService.getExamsForUser().then((exams) => this.availableExams.set(exams));
  }

  openCreateDialog() {
    const opts = this.adminCourseOptions();
    this.newExam = {
      title: '',
      examType: 'JEE',
      course: opts[0]?.id ?? 'jee',
      description: '',
      questions: 50,
      durationMinutes: 60
    };
    this.createError.set('');
    this.showCreateDialog.set(true);
  }

  closeCreateDialog() {
    this.showCreateDialog.set(false);
  }

  createExam() {
    if (!this.newExam.title.trim()) {
      this.createError.set('Exam title is required.');
      return;
    }
    this.creatingExam.set(true);
    this.createError.set('');
    this.examService.createExam(this.newExam).then((exam) => {
      this.creatingExam.set(false);
      if (!exam) {
        this.createError.set('Could not create exam. Check course access.');
        return;
      }
      this.closeCreateDialog();
      this.loadExams();
    });
  }

  resetToSelect() {
    this.stopTimer();
    this.screen.set('select');
    this.activeExam.set(null);
    this.examResults.set(null);
    this.submitted = false;
    this.loadExams();
  }

  startExam(exam: MockExam) {
    if (!this.isStudent()) return;
    this.stopTimer();
    this.submitted = false;
    this.examService.getQuestionsForExam(exam).then((qs) => {
      this.activeExam.set(exam);
      this.questions.set(qs);
      this.answers.set({});
      this.currentIndex.set(0);
      this.visited.set(new Set(qs[0] ? [qs[0].id] : []));
      this.totalSeconds = exam.durationMinutes * 60;
      this.timeLeft.set(this.totalSeconds);
      this.screen.set('exam');
      this.startTimer();
    });
  }

  private startTimer() {
    this.stopTimer();
    this.timerId = setInterval(() => {
      const next = Math.max(0, this.timeLeft() - 1);
      this.timeLeft.set(next);
      if (next <= 0) this.submitExam();
    }, 1000);
  }

  private stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  formatTimer(seconds: number): string {
    return formatTime(seconds);
  }

  timerClass(): string {
    const t = this.timeLeft();
    if (t <= 60) return 'timer-critical';
    if (t <= 300) return 'timer-warning';
    return 'timer-normal';
  }

  goToQuestion(idx: number) {
    const qs = this.questions();
    if (idx < 0 || idx >= qs.length) return;
    this.currentIndex.set(idx);
    this.visited.update((v) => new Set([...v, qs[idx].id]));
  }

  selectOption(optionIndex: number) {
    const q = this.currentQuestion();
    if (!q) return;
    this.answers.update((a) => ({ ...a, [q.id]: optionIndex }));
  }

  clearAnswer() {
    const q = this.currentQuestion();
    if (!q) return;
    this.answers.update((a) => {
      const next = { ...a };
      delete next[q.id];
      return next;
    });
  }

  isAnswered(qId: string): boolean {
    return this.answers()[qId] !== undefined;
  }

  isVisited(qId: string): boolean {
    return this.visited().has(qId);
  }

  paletteClass(q: ExamQuestion): string {
    if (this.isAnswered(q.id)) return 'palette-answered';
    if (this.isVisited(q.id)) return 'palette-visited';
    return 'palette-unvisited';
  }

  confirmSubmit() {
    this.showSubmitConfirm.set(true);
  }

  cancelSubmit() {
    this.showSubmitConfirm.set(false);
  }

  submitExam() {
    if (this.submitted) return;
    this.submitted = true;
    this.stopTimer();
    this.showSubmitConfirm.set(false);
    const exam = this.activeExam();
    if (!exam) return;
    const timeSpent = this.totalSeconds - this.timeLeft();
    const results = this.examService.scoreExam(this.questions(), this.answers(), timeSpent);
    this.examResults.set(results);
    this.examService.saveAttempt(exam, results);
    this.screen.set('results');
  }

  retakeExam() {
    const exam = this.activeExam();
    if (exam) this.startExam(exam);
  }

  toggleReview() {
    this.showReview.update((v) => !v);
  }

  toggleReviewItem(id: string) {
    this.expandedReviewId.update((cur) => (cur === id ? null : id));
  }

  sectionBarClass(pct: number): string {
    if (pct >= 70) return 'bar-good';
    if (pct >= 50) return 'bar-mid';
    return 'bar-low';
  }

  optionLetter(idx: number): string {
    return String.fromCharCode(65 + idx);
  }

  isSelected(qId: string, idx: number): boolean {
    return this.answers()[qId] === idx;
  }

  courseIcon(course: CourseId): string {
    return this.courseIcons[course] ?? '📝';
  }
}
