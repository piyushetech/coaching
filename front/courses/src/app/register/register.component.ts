import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CoursesService } from '../services/courses.service';
import { CourseId } from '../constants/courses';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  coursesService = inject(CoursesService);

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  selectedCourses: CourseId[] = [];
  submitting = false;
  error = '';
  coursesLoading = true;

  ngOnInit() {
    void this.coursesService.load().finally(() => {
      this.coursesLoading = false;
    });
  }

  isCourseSelected(id: CourseId): boolean {
    return this.selectedCourses.includes(id);
  }

  toggleCourse(id: CourseId) {
    this.error = '';
    this.selectedCourses = this.isCourseSelected(id)
      ? this.selectedCourses.filter((c) => c !== id)
      : [...this.selectedCourses, id];
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.selectedCourses.length) {
      this.error = 'Select at least one course.';
      return;
    }
    this.submitting = true;
    this.error = '';
    const { name, email, password } = this.form.value as { name: string; email: string; password: string };
    const res = await this.auth.register(name, email, password, this.selectedCourses);
    if (res.success) {
      this.router.navigateByUrl('/dashboard');
    } else {
      this.error = res.message || 'Registration failed';
    }
    this.submitting = false;
  }
}
