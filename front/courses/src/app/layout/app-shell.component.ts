import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { getUserAvatarUrl, getUserInitial } from '../utils/avatar.util';
import { UploadService } from '../services/upload.service';
import { NotificationService } from '../services/notification.service';
import { CoursesService } from '../services/courses.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.css']
})
export class AppShellComponent implements OnInit {
  auth = inject(AuthService);
  private upload = inject(UploadService);
  private notif = inject(NotificationService);
  private coursesService = inject(CoursesService);
  router = inject(Router);

  unreadCount = this.notif.unreadCount;
  currentUrl = '';

  constructor() {
    this.currentUrl = this.router.url;
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      this.currentUrl = e.urlAfterRedirects;
      this.notif.load();
    });
  }

  ngOnInit() {
    this.notif.load();
    void this.coursesService.load();
  }

  get userName() {
    return this.auth.getUser()?.name ?? 'User';
  }

  get userRole() {
    return this.auth.getUser()?.role ?? 'student';
  }

  get isAdmin() {
    return this.auth.isAdmin();
  }

  get userAvatar() {
    const u = this.auth.getUser();
    return getUserAvatarUrl(u) ?? `https://i.pravatar.cc/40?u=${encodeURIComponent(u?.email ?? 'avatar')}`;
  }

  get userInitial() {
    return getUserInitial(this.auth.getUser());
  }

  get hasCustomAvatar() {
    return !!getUserAvatarUrl(this.auth.getUser());
  }

  get showUpload() {
    return this.isAdmin && !this.currentUrl.includes('/mock-exam');
  }

  isActive(segment: string): boolean {
    const url = this.currentUrl;
    if (segment === 'home') return url === '/dashboard' || url === '/dashboard/';
    return url.includes(`/dashboard/${segment}`);
  }

  onUploadClick() {
    this.upload.requestOpen();
    if (!this.currentUrl.includes('/files')) {
      this.router.navigateByUrl('/dashboard/files');
    }
  }

  onThumbError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.onerror = null;
      img.style.display = 'none';
    }
  }

  logout() {
    const isAdmin = this.auth.isAdmin();
    this.auth.logout();
    this.router.navigateByUrl(isAdmin ? '/admin/login' : '/student/login');
  }
}
