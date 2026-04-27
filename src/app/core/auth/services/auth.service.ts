import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  isLogged = signal<boolean>(false);
  userName = signal<string>('');
  userEmail = signal<string>('');
  userId = signal<string>('');

  /** Call this after login or on app boot to hydrate user signals from token */
  loadUserFromToken(): void {
    const token = localStorage.getItem('TrendoToken');
    if (!token) {
      this.userName.set('');
      this.userEmail.set('');
      return;
    }
    try {
      const decoded: any = jwtDecode(token);
      this.userName.set(decoded.name || '');
      this.userEmail.set(decoded.email || '');
      this.userId.set(decoded.id || '');
    } catch {
      this.userName.set('');
      this.userEmail.set('');
      this.userId.set('');
    }
  }

  signOut(): void {
    localStorage.removeItem('TrendoToken');
    localStorage.removeItem('TrendoUser');
    localStorage.removeItem('TrendoCart');
    this.isLogged.set(false);
    this.userName.set('');
    this.userEmail.set('');
    this.userId.set('');
    this.router.navigate(['/login']);
  }

  signUp(data: any): Observable<any> {
    return this.http.post(`${environment.baseUrl}/api/v1/auth/signup`, data);
  }

  signIn(data: any): Observable<any> {
    return this.http.post(`${environment.baseUrl}/api/v1/auth/signin`, data);
  }

  forgotPassword(data: any): Observable<any> {
    return this.http.post(`${environment.baseUrl}/api/v1/auth/forgotPasswords`, data);
  }

  verifyResetCode(data: any): Observable<any> {
    return this.http.post(`${environment.baseUrl}/api/v1/auth/verifyResetCode`, data);
  }

  resetPassword(data: any): Observable<any> {
    return this.http.put(`${environment.baseUrl}/api/v1/auth/resetPassword`, data);
  }
}
