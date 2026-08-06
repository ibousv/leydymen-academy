import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppConfigService } from './app-config.service';
import type { LessonProgress, Progress, StudentProgressDTO } from '../models';

/**
 * ProgressService — API de progression des leçons (spec §6.5).
 * Adapté au backend qui expose un endpoint générique POST /api/progress
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(AppConfigService).apiUrl;

  /**
   * Track lesson progress - utilise l'endpoint générique POST /api/progress
   * Backend accepte: { lessonId, status, percentageWatched }
   */
  trackLessonProgress(lessonId: number, percent: number): Observable<StudentProgressDTO> {
    return this.http.post<{ data: StudentProgressDTO }>(
      `${this.apiUrl}/progress`,
      {
        lessonId,
        status: 'IN_PROGRESS',
        percentageWatched: percent,
      }
    ).pipe(
      map((response) => response.data)
    );
  }

  /**
   * Mark lesson as complete - utilise l'endpoint générique POST /api/progress
   */
  markLessonAsComplete(lessonId: number): Observable<StudentProgressDTO> {
    return this.http.post<{ data: StudentProgressDTO }>(
      `${this.apiUrl}/progress`,
      {
        lessonId,
        status: 'COMPLETED',
        percentageWatched: 100,
      }
    ).pipe(
      map((response) => response.data)
    );
  }

  getFormationProgress(formationId: number): Observable<Progress> {
    return this.http.get<{ data: Progress }>(
      `${this.apiUrl}/progress/formation/${formationId}`
    ).pipe(
      map((response) => response.data)
    );
  }

  getLessonProgress(lessonId: number): Observable<LessonProgress> {
    return this.http.get<{ data: LessonProgress }>(
      `${this.apiUrl}/progress/lesson/${lessonId}`
    ).pipe(
      map((response) => response.data)
    );
  }

  /**
   * Get enrollment progress - backend retourne ApiResponse<List<StudentProgressDTO>>
   */
  getEnrollmentProgress(enrollmentId: number): Observable<StudentProgressDTO[]> {
    return this.http.get<{ data: StudentProgressDTO[] }>(
      `${this.apiUrl}/progress/enrollment/${enrollmentId}`
    ).pipe(
      map((response) => response.data)
    );
  }
}

