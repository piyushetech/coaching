import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

const REQUEST_TIMEOUT_MS = 20000;
const AUTH_TIMEOUT_MS = 8000;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  readonly baseUrl = environment.apiUrl;

  private withTimeout<T>(obs: Observable<T>, timeoutMs = REQUEST_TIMEOUT_MS): Observable<T> {
    return obs.pipe(
      timeout(timeoutMs),
      catchError((err) => {
        if (err?.name === 'TimeoutError') {
          return throwError(() => ({
            status: 0,
            error: { message: 'Request timed out. Is the backend running on port 4000?' }
          }));
        }
        return throwError(() => err);
      })
    );
  }

  get<T>(path: string): Observable<T> {
    return this.withTimeout(this.http.get<T>(`${this.baseUrl}${path}`));
  }

  post<T>(path: string, body?: unknown, timeoutMs = REQUEST_TIMEOUT_MS): Observable<T> {
    return this.withTimeout(this.http.post<T>(`${this.baseUrl}${path}`, body), timeoutMs);
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.withTimeout(this.http.patch<T>(`${this.baseUrl}${path}`, body));
  }

  delete<T>(path: string): Observable<T> {
    return this.withTimeout(this.http.delete<T>(`${this.baseUrl}${path}`));
  }

  upload<T>(path: string, formData: FormData): Observable<T> {
    return this.withTimeout(this.http.post<T>(`${this.baseUrl}${path}`, formData));
  }

  uploadPatch<T>(path: string, formData: FormData): Observable<T> {
    return this.withTimeout(this.http.patch<T>(`${this.baseUrl}${path}`, formData));
  }
}
