import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';
import { adminGuard } from './services/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'student/login', pathMatch: 'full' },
  { path: 'login', redirectTo: 'student/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'student/register', pathMatch: 'full' },
  {
    path: 'student/login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'student/register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'forgot',
    loadComponent: () => import('./forgot/forgot.component').then(m => m.ForgotComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./layout/app-shell.component').then(m => m.AppShellComponent),
    canActivate: [AuthGuard],
    children: [
      { path: '', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'videos', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'documents', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'feed', loadComponent: () => import('./feed/feed.component').then(m => m.FeedComponent) },
      { path: 'notifications', loadComponent: () => import('./notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'mock-exam', loadComponent: () => import('./mock-exam/mock-exam.component').then(m => m.MockExamComponent) },
      { path: 'files', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [adminGuard] },
      { path: 'settings', loadComponent: () => import('./dashboard/settings.component').then(m => m.DashboardSettingsComponent) }
    ]
  }
];
