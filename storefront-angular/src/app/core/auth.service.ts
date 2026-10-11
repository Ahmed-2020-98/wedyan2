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

const TOKEN_KEY = 'wedyan_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private userSignal = signal<AuthUser | null>(null);

  readonly user = computed(() => this.userSignal());
  readonly isLoggedIn = computed(() => this.userSignal() !== null);
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  constructor() {
    if (this.token()) {
      this.fetchMe().subscribe({
        next: (user) => this.userSignal.set(user),
        error: () => this.logoutLocal(),
      });
    }
  }

  register(data: { name: string; email: string; password: string; password_confirmation: string }): Observable<{ user: AuthUser; token: string }> {
    return this.http.post<{ user: AuthUser; token: string }>(`${API_BASE}/auth/register`, data)
      .pipe(tap((res) => this.setSession(res)));
  }

  login(email: string, password: string): Observable<{ user: AuthUser; token: string }> {
    return this.http.post<{ user: AuthUser; token: string }>(`${API_BASE}/auth/login`, { email, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  logout(): void {
    this.http.post(`${API_BASE}/auth/logout`, {}).subscribe({ complete: () => this.logoutLocal() });
    this.logoutLocal();
  }

  private fetchMe(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${API_BASE}/auth/me`);
  }

  private setSession(res: { user: AuthUser; token: string }): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    this.token.set(res.token);
    this.userSignal.set(res.user);
  }

  private logoutLocal(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.userSignal.set(null);
  }
}
