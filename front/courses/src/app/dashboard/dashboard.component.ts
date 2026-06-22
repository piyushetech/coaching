import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';
import { DataService, DashboardItem } from '../services/data.service';
import { UploadService } from '../services/upload.service';
import { AuthService } from '../services/auth.service';
import { CourseId } from '../constants/courses';
import { CoursesService } from '../services/courses.service';
import { resolveMediaUrl } from '../utils/media-url';

type ViewMode = 'home' | 'videos' | 'documents' | 'files';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private data = inject(DataService);
  private uploadService = inject(UploadService);
  private auth = inject(AuthService);
  private coursesService = inject(CoursesService);
  private sanitizer = inject(DomSanitizer);
  router = inject(Router);

  isAdmin = computed(() => this.auth.isAdmin());
  isOwner = computed(() => this.auth.isOwner());
  courseOptions = this.coursesService.courses;
  courseLabel = (id: CourseId) => this.coursesService.label(id);
  resolveMediaUrl = resolveMediaUrl;
  uploadCourse = signal<CourseId>('jee');

  visibleItems = computed(() => {
    const user = this.auth.getUser();
    return this.items().filter((i) => this.auth.canAccessCourse(i.course, user));
  });

  items = signal<DashboardItem[]>([]);
  selected = signal<DashboardItem | null>(null);
  loading = signal(true);
  viewMode = signal<ViewMode>('home');
  showUpload = signal(false);
  uploading = signal(false);
  uploadProgress = signal(0);
  uploadError = signal('');
  pickedFile = signal<File | null>(null);
  uploadForm = { title: '', description: '' };
  pdfLoading = signal(false);
  pdfViewerUrl = signal<SafeResourceUrl | null>(null);
  openingDocId = signal<string | null>(null);
  openingInTab = signal(false);

  private pdfLoadStartedAt = 0;
  private pdfLoadTimer: ReturnType<typeof setTimeout> | null = null;
  private pdfHideTimer: ReturnType<typeof setTimeout> | null = null;
  private pdfMaxTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly PDF_LOADER_MIN_MS = 900;
  private readonly PDF_LOADER_MAX_MS = 25000;

  /** Institute-wide totals (all admins see these). */
  totalFiles = computed(() => this.items().length);
  totalVideos = computed(() => this.items().filter(i => i.type === 'video').length);
  totalDocs = computed(() => this.items().filter(i => i.type === 'pdf').length);

  /** Current admin's own uploads. */
  myUploads = computed(() => {
    const userId = this.auth.getUser()?.id;
    if (!userId || !this.isAdmin()) return [];
    return this.items().filter(i => i.uploadedBy === userId);
  });
  myVideos = computed(() => this.myUploads().filter(i => i.type === 'video').length);
  myDocs = computed(() => this.myUploads().filter(i => i.type === 'pdf').length);
  myFiles = computed(() => this.myUploads().length);
  storageStats = signal({
    quotaLabel: '100 GB',
    usedLabel: '0 B',
    percentUsed: 0,
    percentLabel: '0%',
    videoLabel: '0 B',
    pdfLabel: '0 B'
  });

  allVideos = computed(() => this.visibleItems().filter(i => i.type === 'video'));
  allDocuments = computed(() => this.visibleItems().filter(i => i.type === 'pdf'));
  allFiles = computed(() => {
    const list = [...this.items()];
    return list.sort((a, b) => (b.dateModified ?? '').localeCompare(a.dateModified ?? ''));
  });

  showEditModal = signal(false);
  editingFile = signal<DashboardItem | null>(null);
  editForm = { title: '', description: '', course: 'jee' as CourseId };
  editReplacementFile = signal<File | null>(null);
  editErr = signal('');
  savingEdit = signal(false);

  displayVideos = computed(() => {
    const videos = this.allVideos();
    return this.viewMode() === 'home' ? videos.slice(0, 3) : videos;
  });

  displayDocuments = computed(() => {
    const docs = this.allDocuments();
    return this.viewMode() === 'home' ? docs.slice(0, 4) : docs;
  });

  pageTitle = computed(() => {
    switch (this.viewMode()) {
      case 'videos': return 'Videos';
      case 'documents': return 'Documents';
      case 'files': return 'All Files';
      default: return 'Dashboard';
    }
  });

  pageSubtitle = computed(() => {
    switch (this.viewMode()) {
      case 'videos': return 'Browse and play your video library';
      case 'documents': return 'PDF and document files';
      case 'files': return 'Manage all uploaded files';
      default: return 'Welcome back — manage your media and documents';
    }
  });

  constructor() {
    void this.coursesService.load();
    this.load();
    this.syncViewFromUrl(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      this.syncViewFromUrl(e.urlAfterRedirects);
      this.closeViewer();
    });

    effect(() => {
      this.uploadService.pendingVersion();
      if (this.uploadService.hasPendingOpen()) {
        this.uploadService.consumeOpen();
        this.openUpload();
      }
    });
  }

  private syncViewFromUrl(url: string) {
    if (url.includes('/videos')) this.viewMode.set('videos');
    else if (url.includes('/documents')) this.viewMode.set('documents');
    else if (url.includes('/files')) this.viewMode.set('files');
    else this.viewMode.set('home');
  }

  async load() {
    this.loading.set(true);
    try {
      const list = await this.data.getDashboardItems();
      this.items.set(list);
      if (this.isOwner()) {
        const storage = await this.data.getStorageStats();
        this.storageStats.set(storage);
      }
    } catch {
      this.items.set([]);
    }
    this.closeViewer();
    this.loading.set(false);
  }

  select(item: DashboardItem) {
    if (item.type === 'pdf' && item.url) {
      this.openingDocId.set(item.id);
      this.startPdfLoad(item);
      return;
    }
    this.clearPdfTimers();
    this.pdfLoading.set(false);
    this.pdfViewerUrl.set(null);
    this.openingDocId.set(null);
    this.selected.set(item);
  }

  private startPdfLoad(item: DashboardItem) {
    this.clearPdfTimers();
    this.pdfLoadStartedAt = Date.now();
    this.pdfLoading.set(true);
    this.pdfViewerUrl.set(null);
    this.selected.set(item);

    this.pdfLoadTimer = setTimeout(() => {
      if (this.selected()?.id !== item.id) return;
      const absoluteUrl = resolveMediaUrl(item.url);
      const viewer = absoluteUrl.startsWith('http://localhost') || absoluteUrl.startsWith('http://127.0.0.1')
        ? absoluteUrl
        : `https://docs.google.com/gview?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
      this.pdfViewerUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(viewer));
      this.pdfMaxTimer = setTimeout(() => this.finishPdfLoad(true), this.PDF_LOADER_MAX_MS);
    }, 10);
  }

  onPdfLoaded() {
    this.finishPdfLoad(false);
  }

  private finishPdfLoad(forced: boolean) {
    if (this.pdfMaxTimer) {
      clearTimeout(this.pdfMaxTimer);
      this.pdfMaxTimer = null;
    }
    const elapsed = Date.now() - this.pdfLoadStartedAt;
    const delay = forced ? 0 : Math.max(200, this.PDF_LOADER_MIN_MS - elapsed);
    if (this.pdfHideTimer) clearTimeout(this.pdfHideTimer);
    this.pdfHideTimer = setTimeout(() => {
      if (this.selected()?.type === 'pdf') {
        this.pdfLoading.set(false);
      }
      this.openingDocId.set(null);
      this.pdfHideTimer = null;
    }, delay);
  }

  private clearPdfTimers() {
    if (this.pdfLoadTimer) {
      clearTimeout(this.pdfLoadTimer);
      this.pdfLoadTimer = null;
    }
    if (this.pdfHideTimer) {
      clearTimeout(this.pdfHideTimer);
      this.pdfHideTimer = null;
    }
    if (this.pdfMaxTimer) {
      clearTimeout(this.pdfMaxTimer);
      this.pdfMaxTimer = null;
    }
  }

  closeViewer() {
    this.clearPdfTimers();
    this.selected.set(null);
    this.pdfLoading.set(false);
    this.pdfViewerUrl.set(null);
    this.openingDocId.set(null);
    this.openingInTab.set(false);
  }

  /** Legacy helper — prefer pdfViewerUrl signal */
  getPdfViewerUrl(): SafeResourceUrl | null {
    return this.pdfViewerUrl();
  }

  openPdfInNewTab() {
    const url = resolveMediaUrl(this.selected()?.url);
    if (!url) return;
    this.openingInTab.set(true);
    window.open(url, '_blank');
    setTimeout(() => this.openingInTab.set(false), 1200);
  }

  onThumbError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.onerror = null;
      img.src = 'https://plus.unsplash.com/premium_photo-1667480556783-119d25e19d6e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    }
  }

  docExtension(title: string): string {
    const match = title.match(/\.(\w+)$/);
    return match ? match[1].toUpperCase() : 'PDF';
  }

  openUpload() {
    this.pickedFile.set(null);
    this.uploadForm = { title: '', description: '' };
    this.uploadCourse.set('jee');
    this.uploadProgress.set(0);
    this.uploadError.set('');
    this.showUpload.set(true);
  }

  closeUpload() {
    if (this.uploading()) return;
    this.showUpload.set(false);
    this.uploadError.set('');
  }

  formatFileSize(bytes: number): string {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  }

  fileTypeIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return '▶';
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    return '📎';
  }

  removePickedFile() {
    this.pickedFile.set(null);
    this.uploadForm = { title: '', description: '' };
  }

  canSubmitUpload(): boolean {
    return (
      !!this.pickedFile() &&
      !!this.uploadForm.title.trim() &&
      !!this.uploadForm.description.trim() &&
      !!this.uploadCourse()
    );
  }

  validateUploadForm(): string | null {
    if (!this.pickedFile()) return 'Please select a file to upload.';
    if (!this.uploadForm.title.trim()) return 'File title is required.';
    if (!this.uploadForm.description.trim()) return 'Description is required.';
    if (!this.uploadCourse()) return 'Course is required.';
    return null;
  }

  editFile(item: DashboardItem) {
    this.editingFile.set(item);
    this.editForm = {
      title: item.title,
      description: item.description ?? '',
      course: item.course
    };
    this.editReplacementFile.set(null);
    this.editErr.set('');
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingFile.set(null);
    this.editReplacementFile.set(null);
    this.editErr.set('');
    this.savingEdit.set(false);
  }

  onEditFilePicked(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    this.editReplacementFile.set(file);
    this.editErr.set('');
  }

  clearEditReplacement() {
    this.editReplacementFile.set(null);
  }

  async saveEditFile() {
    const item = this.editingFile();
    if (!item || !this.editForm.title.trim()) {
      this.editErr.set('File title is required.');
      return;
    }
    this.savingEdit.set(true);
    this.editErr.set('');
    try {
      await this.data.updateItem(
        item.id,
        {
          title: this.editForm.title.trim(),
          description: this.editForm.description.trim(),
          course: this.editForm.course
        },
        this.editReplacementFile() ?? undefined
      );
      await this.load();
      this.closeEditModal();
    } catch {
      this.editErr.set('Could not save changes. Please try again.');
    } finally {
      this.savingEdit.set(false);
    }
  }

  deleteFile(item: DashboardItem) {
    if (!confirm(`Delete "${item.title}"? This action cannot be undone.`)) return;
    this.data.deleteItem(item.id).then(async () => {
      if (this.selected()?.id === item.id) this.closeViewer();
      await this.load();
    });
  }

  onFilePicked(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    this.uploadError.set('');
    this.pickedFile.set(file);
    this.uploadForm.title = file.name.replace(/\.[^.]+$/, '') || file.name;
  }

  private progressTimer: ReturnType<typeof setInterval> | null = null;

  private startProgressAnimation() {
    this.uploadProgress.set(5);
    this.progressTimer = setInterval(() => {
      this.uploadProgress.update((p) => (p >= 92 ? p : p + Math.random() * 6 + 2));
    }, 350);
  }

  private stopProgressAnimation(final = 100) {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
    this.uploadProgress.set(final);
  }

  async uploadSelected() {
    const validationErr = this.validateUploadForm();
    if (validationErr) {
      this.uploadError.set(validationErr);
      return;
    }
    const file = this.pickedFile()!;
    this.uploading.set(true);
    this.uploadError.set('');
    this.startProgressAnimation();
    const course = this.uploadCourse();
    try {
      await this.data.addItems(
        [{
          course,
          title: this.uploadForm.title.trim(),
          description: this.uploadForm.description.trim()
        }],
        [file]
      );
      this.stopProgressAnimation(100);
      await this.load();
      this.showUpload.set(false);
      this.pickedFile.set(null);
      this.uploadForm = { title: '', description: '' };
    } catch {
      this.stopProgressAnimation(0);
      this.uploadError.set('Upload failed. Check your login and ensure the backend is running.');
    } finally {
      this.uploading.set(false);
    }
  }
}
