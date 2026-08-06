import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppConfigService } from './app-config.service';
import type {
  Formation,
  FormationDetail,
  FormationFilters,
  FormationModule,
  FormationPayload,
  Lesson,
  LessonPayload,
  ModulePayload,
  Paginated,
} from '../models';

/**
 * FormationService — API des formations (spec §6.2).
 */
@Injectable({ providedIn: 'root' })
export class FormationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(AppConfigService).apiUrl;

  getFormations(filters: FormationFilters = {}): Observable<Formation[]> {
    return this.http
      .get<Paginated<Formation>>(`${this.apiUrl}/formations`, { params: this.buildParams(filters) })
      .pipe(map((result) => result.items));
  }

  searchFormations(keyword: string): Observable<Formation[]> {
    return this.getFormations({ search: keyword });
  }

  getFormation(id: number): Observable<FormationDetail> {
    return this.http.get<FormationDetail>(`${this.apiUrl}/formations/${id}`);
  }

  createFormation(data: FormationPayload): Observable<Formation> {
    return this.http.post<Formation>(`${this.apiUrl}/formations`, data);
  }

  updateFormation(id: number, data: Partial<FormationPayload>): Observable<Formation> {
    return this.http.put<Formation>(`${this.apiUrl}/formations/${id}`, data);
  }

  deleteFormation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/formations/${id}`);
  }

  getFormationModules(formationId: number): Observable<FormationModule[]> {
    return this.http.get<FormationModule[]>(`${this.apiUrl}/formations/${formationId}/modules`);
  }

  createModule(formationId: number, data: ModulePayload): Observable<FormationModule> {
    return this.http.post<FormationModule>(`${this.apiUrl}/formations/${formationId}/modules`, data);
  }

  updateModule(moduleId: number, data: Partial<ModulePayload>): Observable<FormationModule> {
    return this.http.put<FormationModule>(`${this.apiUrl}/modules/${moduleId}`, data);
  }

  deleteModule(moduleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/modules/${moduleId}`);
  }

  createLesson(moduleId: number, data: LessonPayload): Observable<Lesson> {
    return this.http.post<Lesson>(`${this.apiUrl}/modules/${moduleId}/lessons`, data);
  }

  updateLesson(lessonId: number, data: Partial<LessonPayload>): Observable<Lesson> {
    return this.http.put<Lesson>(`${this.apiUrl}/lessons/${lessonId}`, data);
  }

  deleteLesson(lessonId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/lessons/${lessonId}`);
  }

  private buildParams(filters: FormationFilters): HttpParams {
    let params = new HttpParams();
    const entries: [string, string | number | undefined][] = [
      ['search', filters.search],
      ['category', filters.category],
      ['level', filters.level],
      ['status', filters.status],
      ['sort', filters.sort],
      ['priceMin', filters.priceMin],
      ['priceMax', filters.priceMax],
      ['page', filters.page],
      ['pageSize', filters.pageSize],
    ];
    for (const [key, value] of entries) {
      if (value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return params;
  }
}
