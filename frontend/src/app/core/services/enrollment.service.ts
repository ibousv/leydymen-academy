import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppConfigService } from './app-config.service';
import type { ApiResponse, Enrollment, EnrollmentFilters, EnrollmentStatus, Progress, PaginatedResponse } from '../models';

/**
 * EnrollmentService — API des inscriptions (spec §6.3).
 * Adapté pour unwrapper les réponses ApiResponse du backend
 */
@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(AppConfigService).apiUrl;

  getEnrollments(filters: EnrollmentFilters = {}): Observable<Enrollment[]> {
    let params = new HttpParams();
    if (filters.studentId !== undefined) {
      params = params.set('studentId', String(filters.studentId));
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.formationId !== undefined) {
      params = params.set('formationId', String(filters.formationId));
    }
    return this.http.get<ApiResponse<PaginatedResponse<Enrollment>>>(
      `${this.apiUrl}/enrollments`,
      { params }
    ).pipe(
      map((response) => response.data.content || [])
    );
  }

  getEnrollment(id: number): Observable<Enrollment> {
    return this.http.get<ApiResponse<Enrollment>>(`${this.apiUrl}/enrollments/${id}`)
      .pipe(
        map((response) => response.data)
      );
  }

  enrollFormation(formationId: number): Observable<Enrollment> {
    return this.http.post<ApiResponse<Enrollment>>(
      `${this.apiUrl}/enrollments`,
      { formationId }
    ).pipe(
      map((response) => response.data)
    );
  }

  cancelEnrollment(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/enrollments/${id}`)
      .pipe(
        map(() => undefined)
      );
  }

  updateEnrollmentStatus(id: number, status: EnrollmentStatus): Observable<Enrollment> {
    return this.http.put<ApiResponse<Enrollment>>(
      `${this.apiUrl}/enrollments/${id}/status?status=${status}`,
      {}
    ).pipe(
      map((response) => response.data)
    );
  }

  getEnrollmentProgress(id: number): Observable<Progress> {
    return this.http.get<ApiResponse<Progress>>(
      `${this.apiUrl}/enrollments/${id}/progress`
    ).pipe(
      map((response) => response.data)
    );
  }
}
