import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { clearSavedCredentials, loadSavedCredentials, saveCredentials } from '../services/saved-credentials';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    savePassword: new FormControl(false)
  });

  submitting = false;
  error = '';
  errorType: 'credentials' | 'wrong_portal' | 'network' | null = null;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit() {
    const saved = loadSavedCredentials('student');
    if (saved) {
      this.form.patchValue({
        email: saved.email,
        password: saved.password,
        savePassword: true
      });
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.error = '';
    this.errorType = null;
    const { email, password, savePassword } = this.form.value;
    try {
      const res = await this.auth.loginAsStudent(email!, password!);
      if (res.success) {
        if (savePassword) {
          saveCredentials('student', email!, password!);
        } else {
          clearSavedCredentials('student');
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
