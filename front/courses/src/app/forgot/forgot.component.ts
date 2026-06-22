import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent {
  form = new FormGroup({ email: new FormControl('', [Validators.required, Validators.email]) });
  submitting = false;
  message = '';

  constructor(private auth: AuthService) {}

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.message = '';
    const { email } = this.form.value as any;
    const res = await this.auth.forgotPassword(email);
    this.message = res.message || (res.success ? 'Check your email' : 'Error');
    this.submitting = false;
  }
}
