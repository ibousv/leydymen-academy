import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppConfigService } from './app-config.service';
import type { LessonProgress, Progress } from '../models';

/**
 * ProgressService — API de progression des leçons (spec §6.5).
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(AppConfigService).apiUrl;

  trackLessonProgress(lessonId: number, percent: number): Observable<void> {
    return this.http
      .post(`${this.apiUrl}/progress/lessons/${lessonId}`, { percent })
      .pipe(map(() => undefined));
  }

  markLessonAsComplete(lessonId: number): Observable<void> {
    return this.http.post(`${this.apiUrl}/progress/lessons/${lessonId}/complete`, {}).pipe(map(() => undefined));
  }

  getFormationProgress(formationId: number): Observable<Progress> {
    return this.http.get<Progress>(`${this.apiUrl}/progress/formation/${formationId}`);
  }

  getLessonProgress(lessonId: number): Observable<LessonProgress> {
    return this.http.get<LessonProgress>(`${this.apiUrl}/progress/lesson/${lessonId}`);
  }
}
