import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE } from './api.service';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

const TOKEN_KEY = 'wedyan_admin_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private userSignal = signal<AuthUser | null>(null);

  readonly user = computed(() => this.userSignal());
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly isLoggedIn = computed(() => !!this.token() && this.userSignal()?.role === 'admin');

  constructor() {
    if (this.token()) {
      this.http.get<AuthUser>(`${API_BASE}/auth/me`).subscribe({
        next: (user) => {
          if (user.role !== 'admin') {
            this.logoutLocal();
          } else {
            this.userSignal.set(user);
          }
        },
        error: () => this.logoutLocal(),
      });
    }
  }

  login(email: string, password: string): Observable<{ user: AuthUser; token: string }> {
    return this.http
      .post<{ user: AuthUser; token: string }>(`${API_BASE}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          if (res.user.role !== 'admin') {
            throw new Error('هذا الحساب ليس حساب مدير.');
          }

          localStorage.setItem(TOKEN_KEY, res.token);
          this.token.set(res.token);
          this.userSignal.set(res.user);
        })
      );
  }

  logout(): void {
    this.http.post(`${API_BASE}/auth/logout`, {}).subscribe();
    this.logoutLocal();
  }

  private logoutLocal(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.userSignal.set(null);
  }
}
