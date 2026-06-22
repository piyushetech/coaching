import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, AppUser, CreateUserInput } from '../services/auth.service';
import { FeedbackService, TeacherRatingSummary, StudentFeedback, TeacherAppreciation } from '../services/feedback.service';
import { MockExamService } from '../mock-exam/mock-exam.service';
import { performanceLabel, StudentPerformanceTier } from '../mock-exam/mock-exam.data';
import { CourseId } from '../constants/courses';
import { CoursesService } from '../services/courses.service';
import { getUserAvatarUrl, getUserInitial } from '../utils/avatar.util';

type UserForm = CreateUserInput & { courses: CourseId[] };
type SettingsTab = 'profile' | 'security' | 'users' | 'ratings' | 'courses';
type DialogType = 'add-student' | 'add-admin' | 'edit-student' | 'edit-admin' | 'edit-courses' | 'feedback' | null;

function emptyUserForm(): UserForm {
  return { name: '', email: '', password: '', mobile: '', address: '', education: '', educationMarks: '', courses: [] };
}

@Component({
  selector: 'app-dashboard-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class DashboardSettingsComponent implements OnInit {
  private auth = inject(AuthService);
  private feedback = inject(FeedbackService);
  private examService = inject(MockExamService);
  coursesService = inject(CoursesService);

  performanceLabel = performanceLabel;

  activeTab: SettingsTab = 'profile';
  activeDialog: DialogType = null;
  dialogUser: AppUser | null = null;

  users: AppUser[] = [];
  currentUser: AppUser | null = null;
  teachers: AppUser[] = [];
  teacherSummaries: TeacherRatingSummary[] = [];
  myFeedback: StudentFeedback[] = [];
  receivedAppreciations: TeacherAppreciation[] = [];
  studentPerformance: Record<string, { avg: number | null; tier: StudentPerformanceTier; attempts: number }> = {};

  profile = { mobile: '', address: '', education: '', educationMarks: '' };
  passwordForm = { current: '', next: '', confirm: '' };
  profileMsg = '';
  profileErr = '';
  passwordMsg = '';
  passwordErr = '';
  savingProfile = false;
  savingPassword = false;
  savingAvatar = false;

  getUserAvatarUrl = getUserAvatarUrl;
  getUserInitial = getUserInitial;

  ratingForms: Record<string, { rating: number; comment: string; hasExisting: boolean }> = {};
  appreciationForms: Record<string, { message: string; hasExisting: boolean }> = {};
  ratingMsg = '';
  ratingErr = '';
  appreciationMsg = '';
  appreciationErr = '';

  feedbackText = '';
  feedbackErr = '';
  savingFeedback = false;
  editingFeedbackId: string | null = null;
  adminFeedbackHistory: StudentFeedback[] = [];

  newStudent = emptyUserForm();
  newAdmin = emptyUserForm();
  toastMsg = '';
  toastErr = '';
  studentErr = '';
  adminErr = '';
  creatingStudent = false;
  creatingAdmin = false;

  editCourses: CourseId[] = [];
  editStudent = { email: '', mobile: '' };
  editAdmin = { name: '', email: '', mobile: '' };
  savingStudent = false;
  savingAdmin = false;

  newCourseName = '';
  addingCourse = false;
  deletingCourseId: string | null = null;
  courseMsg = '';
  courseErr = '';

  courseLabel = (id: CourseId) => this.coursesService.label(id);
  courseLabels = (ids: CourseId[] | undefined) => this.coursesService.labels(ids);

  ngOnInit() {
    void this.refresh();
  }

  async refresh() {
    await this.auth.refreshCurrentUser();
    await this.coursesService.load();
    this.currentUser = this.auth.getUser();
    if (this.isAdmin) {
      try {
        this.users = await this.auth.getAllUsers();
      } catch {
        this.users = [];
      }
      await this.loadStudentPerformance();
    } else {
      this.users = [];
    }
    this.teachers = await this.feedback.getTeachers();
    if (this.isOwner) {
      this.teacherSummaries = await this.feedback.getTeacherRatingSummaries();
    }
    this.myFeedback = await this.feedback.getMyFeedback();
    if (this.isAdmin) {
      this.receivedAppreciations = await this.feedback.getReceivedAppreciations();
    } else {
      this.receivedAppreciations = [];
    }
    await this.initRatingForms();
    await this.initAppreciationForms();

    const p = this.currentUser?.profile ?? {};
    this.profile = {
      mobile: p.mobile ?? '',
      address: p.address ?? '',
      education: p.education ?? '',
      educationMarks: p.educationMarks ?? ''
    };
  }

  async loadStudentPerformance() {
    const students = this.users.filter((u) => u.role === 'student');
    const entries = await Promise.all(
      students.map(async (u) => [u.id, await this.examService.getStudentPerformance(u.id)] as const)
    );
    this.studentPerformance = Object.fromEntries(entries);
  }

  async initRatingForms() {
    for (const t of this.teachers) {
      const existing = await this.feedback.getMyRatingForTeacher(t.id);
      this.ratingForms[t.id] = {
        rating: existing?.rating ?? 0,
        comment: existing?.comment ?? '',
        hasExisting: !!existing
      };
    }
  }

  async initAppreciationForms() {
    if (!this.isStudent) return;
    const mine = await this.feedback.getMyAppreciations();
    const byTeacher = new Map(mine.map((a) => [a.teacherId, a]));
    for (const t of this.teachers) {
      const existing = byTeacher.get(t.id);
      this.appreciationForms[t.id] = {
        message: existing?.message ?? '',
        hasExisting: !!existing
      };
    }
  }

  get isAdmin() {
    return this.auth.isAdmin();
  }

  get isOwner() {
    return this.auth.isOwner();
  }

  get isStudent() {
    return this.auth.isStudent();
  }

  isHeadAdmin(user: AppUser): boolean {
    return this.auth.isOwnerUser(user);
  }

  getStudentScore(user: AppUser): { avg: number | null; tier: StudentPerformanceTier; attempts: number } {
    if (user.role !== 'student') return { avg: null, tier: 'none', attempts: 0 };
    return this.studentPerformance[user.id] ?? { avg: null, tier: 'none', attempts: 0 };
  }

  performanceClass(tier: StudentPerformanceTier): string {
    switch (tier) {
      case 'good': return 'perf-good';
      case 'average': return 'perf-avg';
      case 'needs-improvement': return 'perf-low';
      default: return 'perf-none';
    }
  }

  setTab(tab: SettingsTab) {
    this.activeTab = tab;
    this.toastMsg = '';
    this.toastErr = '';
    if (tab === 'ratings') {
      void this.feedback.getTeacherRatingSummaries().then((s) => (this.teacherSummaries = s));
    }
  }

  openDialog(type: DialogType, user?: AppUser) {
    this.activeDialog = type;
    this.dialogUser = user ?? null;
    this.studentErr = '';
    this.adminErr = '';
    this.feedbackText = '';
    this.feedbackErr = '';
    this.editingFeedbackId = null;
    this.adminFeedbackHistory = [];

    if (type === 'add-student') this.newStudent = emptyUserForm();
    if (type === 'add-admin') this.newAdmin = emptyUserForm();
    if (type === 'edit-student' && user) {
      this.editStudent = { email: user.email, mobile: user.profile?.mobile ?? '' };
    }
    if (type === 'edit-admin' && user) {
      this.editAdmin = { name: user.name, email: user.email, mobile: user.profile?.mobile ?? '' };
    }
    if (type === 'edit-courses' && user) {
      this.editCourses = [...(user.courses ?? [])];
    }
    if (type === 'feedback' && user) {
      void this.loadAdminFeedbackForStudent(user.id);
    }
  }

  async loadAdminFeedbackForStudent(studentId: string) {
    this.adminFeedbackHistory = await this.feedback.getMyFeedbackToStudent(studentId);
    const latest = this.adminFeedbackHistory[0];
    if (latest) {
      this.feedbackText = latest.message;
      this.editingFeedbackId = latest.id;
    }
  }

  startNewFeedbackToStudent() {
    this.editingFeedbackId = null;
    this.feedbackText = '';
    this.feedbackErr = '';
  }

  editAdminFeedback(entry: StudentFeedback) {
    this.editingFeedbackId = entry.id;
    this.feedbackText = entry.message;
    this.feedbackErr = '';
  }

  closeDialog() {
    this.activeDialog = null;
    this.dialogUser = null;
    this.studentErr = '';
    this.adminErr = '';
    this.feedbackErr = '';
  }

  toggleCourse(list: CourseId[], course: CourseId): CourseId[] {
    return list.includes(course) ? list.filter((c) => c !== course) : [...list, course];
  }

  isCourseSelected(list: CourseId[], course: CourseId): boolean {
    return list.includes(course);
  }

  setStar(teacherId: string, stars: number) {
    if (!this.ratingForms[teacherId]) {
      this.ratingForms[teacherId] = { rating: 0, comment: '', hasExisting: false };
    }
    this.ratingForms[teacherId].rating = stars;
  }

  hasRating(teacherId: string): boolean {
    return !!this.ratingForms[teacherId]?.hasExisting;
  }

  hasAppreciation(teacherId: string): boolean {
    return !!this.appreciationForms[teacherId]?.hasExisting;
  }

  async submitRating(teacherId: string) {
    const form = this.ratingForms[teacherId];
    if (!form?.rating) {
      this.ratingErr = 'Please select a star rating.';
      return;
    }
    this.ratingErr = '';
    const res = await this.feedback.submitRating(teacherId, form.rating, form.comment);
    if (res.success) {
      form.hasExisting = true;
      this.ratingMsg = res.message || 'Rating saved.';
      setTimeout(() => (this.ratingMsg = ''), 3000);
    } else {
      this.ratingErr = res.message || 'Could not submit rating.';
    }
  }

  async submitAppreciation(teacherId: string) {
    const form = this.appreciationForms[teacherId];
    if (!form?.message.trim()) {
      this.appreciationErr = 'Please write a message of appreciation or feedback.';
      return;
    }
    this.appreciationErr = '';
    const res = await this.feedback.submitAppreciation(teacherId, form.message.trim());
    if (res.success) {
      form.hasExisting = true;
      this.appreciationMsg = res.message || 'Appreciation saved.';
      setTimeout(() => (this.appreciationMsg = ''), 3000);
    } else {
      this.appreciationErr = res.message || 'Could not send appreciation.';
    }
  }

  async saveFeedback() {
    if (!this.dialogUser || !this.feedbackText.trim()) {
      this.feedbackErr = 'Feedback message is required.';
      return;
    }
    this.savingFeedback = true;
    this.feedbackErr = '';
    const res = this.editingFeedbackId
      ? await this.feedback.updateStudentFeedback(this.editingFeedbackId, this.feedbackText.trim())
      : await this.feedback.addStudentFeedback(this.dialogUser.id, this.feedbackText.trim());
    this.savingFeedback = false;
    if (!res.success) {
      this.feedbackErr = res.message || 'Could not save feedback.';
      return;
    }
    this.closeDialog();
    this.showToast(res.message || 'Feedback saved.');
    void this.refresh();
  }

  private showToast(success: string) {
    this.toastMsg = success;
    this.toastErr = '';
    setTimeout(() => (this.toastMsg = ''), 4000);
  }

  async saveProfile() {
    this.savingProfile = true;
    this.profileMsg = '';
    this.profileErr = '';
    const res = await this.auth.updateProfile({ ...this.profile });
    if (res.success) {
      this.profileMsg = res.message || 'Profile saved.';
      void this.refresh();
    } else {
      this.profileErr = res.message || 'Could not save profile.';
    }
    this.savingProfile = false;
  }

  async onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.profileErr = 'Please choose a JPG, PNG, or WebP image.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.profileErr = 'Image must be 5 MB or smaller.';
      return;
    }
    this.savingAvatar = true;
    this.profileErr = '';
    this.profileMsg = '';
    const res = await this.auth.uploadProfileAvatar(file);
    this.savingAvatar = false;
    if (res.success) {
      this.profileMsg = res.message || 'Profile photo updated.';
      void this.refresh();
    } else {
      this.profileErr = res.message || 'Could not upload photo.';
    }
  }

  async removeAvatar() {
    if (!this.currentUser?.profile?.avatarUrl) return;
    this.savingAvatar = true;
    this.profileErr = '';
    const res = await this.auth.removeProfileAvatar();
    this.savingAvatar = false;
    if (res.success) {
      this.profileMsg = res.message || 'Profile photo removed.';
      void this.refresh();
    } else {
      this.profileErr = res.message || 'Could not remove photo.';
    }
  }

  async changePassword() {
    if (this.passwordForm.next !== this.passwordForm.confirm) {
      this.passwordErr = 'New passwords do not match.';
      this.passwordMsg = '';
      return;
    }
    this.savingPassword = true;
    this.passwordErr = '';
    this.passwordMsg = '';
    const res = await this.auth.changePassword(this.passwordForm.current, this.passwordForm.next);
    if (res.success) {
      this.passwordMsg = res.message || 'Password updated.';
      this.passwordForm = { current: '', next: '', confirm: '' };
    } else {
      this.passwordErr = res.message || 'Could not change password.';
    }
    this.savingPassword = false;
  }

  private validateUserForm(form: UserForm): string | null {
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      return 'Name, email, and password (min 6 chars) are required.';
    }
    return null;
  }

  async addStudent() {
    const err = this.validateUserForm(this.newStudent);
    if (err) {
      this.studentErr = err;
      return;
    }
    this.creatingStudent = true;
    this.studentErr = '';
    try {
      const res = await this.auth.createUser({ ...this.newStudent }, 'student');
      if (res.success) {
        this.closeDialog();
        this.setTab('users');
        this.showToast(res.message || 'Student created.');
        void this.refresh();
      } else {
        this.studentErr = res.message || 'Could not create student.';
      }
    } finally {
      this.creatingStudent = false;
    }
  }

  async addAdmin() {
    const err = this.validateUserForm(this.newAdmin);
    if (err) {
      this.adminErr = err;
      return;
    }
    this.creatingAdmin = true;
    this.adminErr = '';
    try {
      const res = await this.auth.createUser({ ...this.newAdmin }, 'admin');
      if (res.success) {
        this.closeDialog();
        this.setTab('users');
        this.showToast(res.message || 'Admin created.');
        void this.refresh();
      } else {
        this.adminErr = res.message || 'Could not create admin.';
      }
    } finally {
      this.creatingAdmin = false;
    }
  }

  async saveAdminDetails() {
    if (!this.dialogUser) return;
    if (!this.editAdmin.name.trim() || !this.editAdmin.email.trim()) {
      this.adminErr = 'Name and email are required.';
      return;
    }
    this.savingAdmin = true;
    this.adminErr = '';
    const res = await this.auth.updateUserByAdmin(this.dialogUser.id, {
      name: this.editAdmin.name.trim(),
      email: this.editAdmin.email.trim(),
      mobile: this.editAdmin.mobile
    });
    this.savingAdmin = false;
    if (!res.success) {
      this.adminErr = res.message || 'Could not update admin.';
      return;
    }
    this.closeDialog();
    this.showToast(res.message || 'Admin updated.');
    void this.refresh();
  }

  async saveStudentDetails() {
    if (!this.dialogUser) return;
    if (!this.editStudent.email.trim()) {
      this.studentErr = 'Email is required.';
      return;
    }
    this.savingStudent = true;
    this.studentErr = '';
    const res = await this.auth.updateStudentByAdmin(this.dialogUser.id, {
      email: this.editStudent.email,
      mobile: this.editStudent.mobile
    });
    this.savingStudent = false;
    if (!res.success) {
      this.studentErr = res.message || 'Could not update student.';
      return;
    }
    this.closeDialog();
    this.showToast(res.message || 'Student updated.');
    this.refresh();
  }

  async saveCourses() {
    if (!this.dialogUser) return;
    const ok = await this.auth.updateUserCourses(this.dialogUser.id, this.editCourses);
    if (!ok) {
      this.toastErr = 'Could not update course access.';
      return;
    }
    this.closeDialog();
    this.showToast('Course access updated.');
    void this.refresh();
  }

  async addCourse() {
    const name = this.newCourseName.trim();
    if (!name) {
      this.courseErr = 'Enter a course name.';
      return;
    }
    this.addingCourse = true;
    this.courseErr = '';
    this.courseMsg = '';
    const res = await this.coursesService.addCourse(name);
    this.addingCourse = false;
    if (res.success) {
      this.newCourseName = '';
      this.courseMsg = res.message || 'Course added.';
      setTimeout(() => (this.courseMsg = ''), 4000);
    } else {
      this.courseErr = res.message || 'Could not add course.';
    }
  }

  async deleteCourse(id: string, label: string) {
    if (!confirm(`Delete course "${label}"? This only works if no files, exams, or students use it.`)) return;
    this.deletingCourseId = id;
    this.courseErr = '';
    this.courseMsg = '';
    const res = await this.coursesService.deleteCourse(id);
    this.deletingCourseId = null;
    if (res.success) {
      this.courseMsg = res.message || 'Course deleted.';
      setTimeout(() => (this.courseMsg = ''), 4000);
    } else {
      this.courseErr = res.message || 'Could not delete course.';
    }
  }

  async deleteUser(user: AppUser) {
    if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    const res = await this.auth.deleteUser(user.id);
    if (!res.success) {
      this.toastErr = res.message || 'Could not delete user.';
      return;
    }
    this.showToast(res.message || 'User deleted.');
    void this.refresh();
  }
}
