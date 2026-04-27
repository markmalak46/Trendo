import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  
  const toastrService = inject(ToastrService);
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Token expired or invalid — clear session and redirect to login
        toastrService.warning('Your session has expired. Please sign in again.', 'Session Expired', { progressBar: true, closeButton: true });
        authService.signOut();
      } else {
        toastrService.error(error?.error?.message, 'Error', { progressBar: true, closeButton: true });
      }
      return throwError(() => error);
    })
  );
};
