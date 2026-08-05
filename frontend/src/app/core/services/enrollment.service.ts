import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';
import type { Enrollment, EnrollmentFilters, EnrollmentStatus, Progress } from '../models';

/**
 * EnrollmentService — API des inscriptions (spec §6.3).
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
    return this.http.get<Enrollment[]>(`${this.apiUrl}/enrollments`, { params });
  }

  getEnrollment(id: number): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.apiUrl}/enrollments/${id}`);
  }

  enrollFormation(formationId: number): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.apiUrl}/enrollments`, { formationId });
  }

  cancelEnrollment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/enrollments/${id}`);
  }

  updateEnrollmentStatus(id: number, status: EnrollmentStatus): Observable<Enrollment> {
    return this.http.patch<Enrollment>(`${this.apiUrl}/enrollments/${id}/status`, { status });
  }

  getEnrollmentProgress(id: number): Observable<Progress> {
    return this.http.get<Progress>(`${this.apiUrl}/enrollments/${id}/progress`);
  }
}
