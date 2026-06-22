import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

function isApiRequest(url: string): boolean {
  return (
    url.startsWith('/api') ||
    url.startsWith(environment.apiUrl) ||
    (!!environment.serverUrl && url.startsWith(environment.serverUrl))
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  if (token && isApiRequest(req.url)) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthRoute =
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/register') ||
        req.url.includes('/auth/forgot-password');

      if (err.status === 401 && isApiRequest(req.url) && !isAuthRoute) {
        auth.handleUnauthorized();
      }
      return throwError(() => err);
    })
  );
};
