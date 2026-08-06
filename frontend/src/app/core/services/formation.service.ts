import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppConfigService } from './app-config.service';
import type {
  ApiResponse,
  Formation,
  FormationDetail,
  FormationFilters,
  FormationModule,
  FormationPayload,
  Lesson,
  LessonPayload,
  ModulePayload,
  Paginated,
  PaginatedResponse,
} from '../models';

/**
 * FormationService — API des formations (spec §6.2).
 * Adapté pour unwrapper les réponses ApiResponse du backend
 */
@Injectable({ providedIn: 'root' })
export class FormationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(AppConfigService).apiUrl;

  getFormations(filters: FormationFilters = {}): Observable<Formation[]> {
    return this.http
      .get<ApiResponse<PaginatedResponse<Formation>>>(`${this.apiUrl}/formations`, { params: this.buildParams(filters) })
      .pipe(
        map((response) => {
          // Backend retourne ApiResponse<PaginatedResponse<Formation>>
          const paginatedData = response.data;
          return paginatedData.content || [];
        })
      );
  }

  searchFormations(keyword: string): Observable<Formation[]> {
    return this.getFormations({ search: keyword });
  }

  getFormation(id: number): Observable<FormationDetail> {
    return this.http.get<ApiResponse<FormationDetail>>(`${this.apiUrl}/formations/${id}`)
      .pipe(
        map((response) => response.data)
      );
  }

  createFormation(data: FormationPayload): Observable<Formation> {
    return this.http.post<ApiResponse<Formation>>(`${this.apiUrl}/formations`, data)
      .pipe(
        map((response) => response.data)
      );
  }

  updateFormation(id: number, data: Partial<FormationPayload>): Observable<Formation> {
    return this.http.put<ApiResponse<Formation>>(`${this.apiUrl}/formations/${id}`, data)
      .pipe(
        map((response) => response.data)
      );
  }

  deleteFormation(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/formations/${id}`)
      .pipe(
        map(() => undefined)
      );
  }

  /**
   * Get formation modules - backend retourne ApiResponse<List<ModuleDTO>>
   */
  getFormationModules(formationId: number): Observable<FormationModule[]> {
    return this.http.get<ApiResponse<FormationModule[]>>(
      `${this.apiUrl}/formations/${formationId}/modules`
    ).pipe(
      map((response) => response.data || [])
    );
  }

  createModule(formationId: number, data: ModulePayload): Observable<FormationModule> {
    return this.http.post<ApiResponse<FormationModule>>(
      `${this.apiUrl}/formations/${formationId}/modules`,
      data
    ).pipe(
      map((response) => response.data)
    );
  }

  updateModule(moduleId: number, data: Partial<ModulePayload>): Observable<FormationModule> {
    return this.http.put<ApiResponse<FormationModule>>(
      `${this.apiUrl}/modules/${moduleId}`,
      data
    ).pipe(
      map((response) => response.data)
    );
  }

  deleteModule(moduleId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/modules/${moduleId}`)
      .pipe(
        map(() => undefined)
      );
  }

  createLesson(moduleId: number, data: LessonPayload): Observable<Lesson> {
    return this.http.post<ApiResponse<Lesson>>(
      `${this.apiUrl}/modules/${moduleId}/lessons`,
      data
    ).pipe(
      map((response) => response.data)
    );
  }

  updateLesson(lessonId: number, data: Partial<LessonPayload>): Observable<Lesson> {
    return this.http.put<ApiResponse<Lesson>>(
      `${this.apiUrl}/lessons/${lessonId}`,
      data
    ).pipe(
      map((response) => response.data)
    );
  }

  deleteLesson(lessonId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/lessons/${lessonId}`)
      .pipe(
        map(() => undefined)
      );
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

