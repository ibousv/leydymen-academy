import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { STORAGE_KEYS } from '../../shared/constants';
import { normalizeUserStatus } from '../utils/status.utils';
import type {
  ApiResponse,
  ForgotPasswordPayload,
  LoginCredentials,
  LoginResponse,
  LoginResponseData,
  RegisterPayload,
  TokenResponse,
  TokenResponseData,
  User,
  UserRole,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(AppConfigService).apiUrl;

  private readonly USERID_KEY = 'leydymen_userid';

  register(userData: RegisterPayload): Observable<User> {
    return this.http
      .post<ApiResponse<LoginResponseData>>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        map((response) => {
          const data = response.data;
          const now = new Date().toISOString();
          return {
            id: data.userId,
            username: data.username,
            email: data.email,
            role: data.role,
            firstName: '',
            lastName: '',
            status: 'active',
            createdAt: now,
            updatedAt: now,
            lastActive: now,
            lastLogin: now,
            phone: '',
            profileImage: null,
          } as User;
        }),
      );
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponseData>>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        map((response) => {
          const data = response.data;
          const now = new Date().toISOString();
          // Construire la réponse LoginResponse à partir de ApiResponse
          return {
            token: data.token,
            refreshToken: data.refreshToken,
            user: {
              id: data.userId,
              username: data.username,
              email: data.email,
              role: data.role,
              firstName: data.username,
              lastName: '',
              status: normalizeUserStatus(data.role === 'ADMIN' ? 'active' : 'active'),
              createdAt: now,
              updatedAt: now,
              lastActive: now,
              lastLogin: now,
              phone: '',
              profileImage: null,
            } as User,
          };
        }),
        tap((response) => {
          console.log('Login response processed:', {
            hasToken: !!response.token,
            tokenLength: response.token?.length,
            tokenParts: response.token?.split('.').length,
            hasRefreshToken: !!response.refreshToken,
            hasUser: !!response.user,
            userId: response.user.id,
          });
          this.setToken(response.token);
          this.setRefreshToken(response.refreshToken);
          this.setUserId(response.user.id);
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
    localStorage.removeItem(this.USERID_KEY);
  }

  refreshToken(): Observable<TokenResponse> {
    return this.http
      .post<ApiResponse<TokenResponseData>>(`${this.apiUrl}/auth/refresh-token`, { 
        refreshToken: this.getRefreshToken() 
      })
      .pipe(
        map((response) => {
          const data = response.data;
          return {
            token: data.token,
            refreshToken: data.refreshToken,
          };
        }),
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
    // Récupérer le userId stocké lors du login (c'est le bon ID numérique)
    const userId = this.getUserId();
    
    if (!userId) {
      return new Observable((observer) => {
        observer.error(new Error('No userId found. Please log in.'));
      });
    }
    
    console.log('Fetching user from backend with userId:', userId);
    
    // Appeler /api/users/{userId} pour récupérer l'utilisateur complet du backend
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/users/${userId}`).pipe(
      map((response) => ({
        ...response.data,
        status: normalizeUserStatus(response.data.status),
      })),
    );
  }

  isAuthenticated(): boolean {
    return this.getToken() !== '';
  }

  getToken(): string {
    if (typeof localStorage === 'undefined') {
      return '';
    }
    const token = localStorage.getItem(STORAGE_KEYS.token) ?? '';
    // Valider le format du token (JWT doit avoir 3 parties)
    if (token && !token.includes('.')) {
      console.warn('Invalid token format stored, clearing');
      localStorage.removeItem(STORAGE_KEYS.token);
      return '';
    }
    return token;
  }

  setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      console.log('Storing token:', {
        length: token?.length,
        parts: token?.split('.').length,
        preview: token?.substring(0, 50) + '...',
      });
      localStorage.setItem(STORAGE_KEYS.token, token);
    }
  }

  private setUserId(userId: number | string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.USERID_KEY, String(userId));
    }
  }

  private getUserId(): number | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const raw = localStorage.getItem(this.USERID_KEY);
    if (!raw) {
      return null;
    }
    try {
      const num = parseInt(raw, 10);
      return isNaN(num) ? null : num;
    } catch {
      return null;
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
    // Optionnel: stocker pour cache rapide si besoin, mais toujours récupérer du backend
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    }
  }

  private getStoredUser(): User | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.user);
      if (!raw || raw === 'undefined' || raw === 'null') {
        return null;
      }
      return JSON.parse(raw) as User;
    } catch (e) {
      console.warn('Failed to parse stored user, ignoring:', e);
      // Nettoyer les données corrompues
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.user);
      }
      return null;
    }
  }
}
