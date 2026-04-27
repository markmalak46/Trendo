import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  userName = signal<string>('');
  userEmail = signal<string>('');
  userPhone = signal<string>('');
  userRole = signal<string>('');
  memberSince = signal<string>('');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('TrendoToken');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          this.userName.set(decoded.name || 'Member');
          this.userEmail.set(decoded.email || '');
          this.userPhone.set(decoded.phone || '');
          this.userRole.set(decoded.role || 'user');

          if (decoded.iat) {
            const date = new Date(decoded.iat * 1000);
            this.memberSince.set(date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
          }
        } catch (e) {
        }
      }

      if (!this.userName()) {
        const storedUser = localStorage.getItem('TrendoUser');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          this.userName.set(u.name || 'Member');
          this.userEmail.set(u.email || '');
          this.userPhone.set(u.phone || '');
        }
      }
    }
  }

  get initials(): string {
    const parts = this.userName().split(' ');
    return parts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('');
  }
}
