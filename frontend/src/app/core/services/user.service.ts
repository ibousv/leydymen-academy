import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, from, map, switchMap } from 'rxjs';
import { AppConfigService } from './app-config.service';
import type { ApiResponse, ChangePasswordPayload, User, UserFilters, UserUpdatePayload, PaginatedResponse } from '../models';

/**
 * UserService — API des utilisateurs (spec §6.4).
 * Adapté pour unwrapper les réponses ApiResponse du backend
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(AppConfigService).apiUrl;

  getUsers(filters: UserFilters = {}): Observable<User[]> {
    let params = new HttpParams();
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.role) {
      params = params.set('role', filters.role);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.page !== undefined) {
      params = params.set('page', String(filters.page));
    }
    if (filters.pageSize !== undefined) {
      params = params.set('pageSize', String(filters.pageSize));
    }
    return this.http
      .get<ApiResponse<PaginatedResponse<User>>>(`${this.apiUrl}/users`, { params })
      .pipe(
        map((response) => response.data.content || [])
      );
  }

  getUser(id: number): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/users/${id}`)
      .pipe(
        map((response) => response.data)
      );
  }

  updateUser(id: number, data: UserUpdatePayload): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/users/${id}`, data)
      .pipe(
        map((response) => response.data)
      );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/users/${id}`)
      .pipe(
        map(() => undefined)
      );
  }

  /**
   * changePassword - endpoint n'existe pas au backend
   * Retourne une erreur explicite
   */
  changePassword(data: ChangePasswordPayload): Observable<void> {
    console.warn('changePassword: endpoint /users/change-password n\'existe pas au backend');
    return new Observable((observer) => {
      observer.error(new Error('Change password endpoint not available'));
    });
  }

  /**
   * uploadProfileImage - endpoint n'existe pas au backend
   * Retourne une erreur explicite
   */
  uploadProfileImage(file: File): Observable<string> {
    console.warn('uploadProfileImage: endpoint /users/profile-image n\'existe pas au backend');
    return new Observable((observer) => {
      observer.error(new Error('Profile image upload endpoint not available'));
    });
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
