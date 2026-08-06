import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, from, map, switchMap } from 'rxjs';
import { AppConfigService } from './app-config.service';
import type { ChangePasswordPayload, Paginated, User, UserFilters, UserUpdatePayload } from '../models';

/**
 * UserService — API des utilisateurs (spec §6.4).
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
      .get<Paginated<User>>(`${this.apiUrl}/users`, { params })
      .pipe(map((result) => result.items));
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  updateUser(id: number, data: UserUpdatePayload): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  changePassword(data: ChangePasswordPayload): Observable<void> {
    return this.http.post(`${this.apiUrl}/users/change-password`, data).pipe(map(() => undefined));
  }

  uploadProfileImage(file: File): Observable<string> {
    return from(this.fileToDataUrl(file)).pipe(
      switchMap((imageUrl) => this.http.post<{ imageUrl: string }>(`${this.apiUrl}/users/profile-image`, { imageUrl })),
      map((response) => response.imageUrl),
    );
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
