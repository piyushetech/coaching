import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { clearSavedCredentials, loadSavedCredentials, saveCredentials } from '../services/saved-credentials';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    savePassword: new FormControl(false)
  });

  submitting = false;
  error = '';
  errorType: 'credentials' | 'wrong_portal' | 'network' | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    const saved = loadSavedCredentials('admin');
    if (saved) {
      this.loginForm.patchValue({
        email: saved.email,
        password: saved.password,
        savePassword: true
      });
    }
  }

  async submitLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.error = '';
    this.errorType = null;
    const { email, password, savePassword } = this.loginForm.value as {
      email: string;
      password: string;
      savePassword: boolean;
    };
    try {
      const res = await this.auth.loginAsAdmin(email, password);
      if (res.success) {
        if (savePassword) {
          saveCredentials('admin', email, password);
        } else {
          clearSavedCredentials('admin');
        }
        this.router.navigateByUrl('/dashboard');
      } else {
        this.error = res.message || 'Incorrect email or password. Please check your username and password.';
        this.errorType = res.errorType ?? 'credentials';
      }
    } finally {
      this.submitting = false;
    }
  }
}
