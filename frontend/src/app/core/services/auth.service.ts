import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { STORAGE_KEYS } from '../../shared/constants';
import type {
  ForgotPasswordPayload,
  LoginCredentials,
  LoginResponse,
  RegisterPayload,
  TokenResponse,
  User,
  UserRole,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(AppConfigService).apiUrl;

  register(userData: RegisterPayload): Observable<User> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(map((response) => response.user));
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        this.setToken(response.token);
        this.setRefreshToken(response.refreshToken);
        this.setUser(response.user);
      }),
    );
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/forgot-password`, payload);
  }

  logout(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.user);
  }

  refreshToken(): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${this.apiUrl}/auth/refresh-token`, { refreshToken: this.getRefreshToken() })
      .pipe(
        tap((response) => {
          this.setToken(response.token);
          this.setRefreshToken(response.refreshToken);
        }),
      );
  }

  getRefreshToken(): string {
    if (typeof localStorage === 'undefined') {
      return '';
    }
    return localStorage.getItem(STORAGE_KEYS.refreshToken) ?? '';
  }

  hasRefreshToken(): boolean {
    return this.getRefreshToken() !== '';
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== '';
  }

  getToken(): string {
    if (typeof localStorage === 'undefined') {
      return '';
    }
    return localStorage.getItem(STORAGE_KEYS.token) ?? '';
  }

  setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.token, token);
    }
  }

  hasRole(role: UserRole): boolean {
    return this.getStoredUser()?.role === role;
  }

  getUserRole(): UserRole | null {
    return this.getStoredUser()?.role ?? null;
  }

  private setRefreshToken(refreshToken: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
    }
  }

  private setUser(user: User): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    }
  }

  private getStoredUser(): User | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
