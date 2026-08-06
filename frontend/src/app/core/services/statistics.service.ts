import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppConfigService } from './app-config.service';
import type { DashboardStats, FormationStats, RevenueStats, UserStats } from '../models';

/**
 * StatisticsService — API des statistiques (spec §6.6).
 * Adapté aux endpoints backend réels:
 * - /statistics/dashboard
 * - /statistics/formations/{formationId}
 * - /statistics/students/{studentId}
 */
@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(AppConfigService).apiUrl;

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<{ data: DashboardStats }>(
      `${this.apiUrl}/statistics/dashboard`
    ).pipe(
      map((response) => response.data)
    );
  }

  /**
   * Get formation statistics - backend expose /statistics/formations/{formationId}
   */
  getFormationStats(formationId: number): Observable<FormationStats> {
    return this.http.get<{ data: FormationStats }>(
      `${this.apiUrl}/statistics/formations/${formationId}`
    ).pipe(
      map((response) => response.data)
    );
  }

  /**
   * Get student statistics - backend expose /statistics/students/{studentId}
   * Remplace getUserStats qui n'existe pas au backend
   */
  getStudentStats(studentId: number): Observable<UserStats> {
    return this.http.get<{ data: UserStats }>(
      `${this.apiUrl}/statistics/students/${studentId}`
    ).pipe(
      map((response) => response.data)
    );
  }

  /**
   * getUserStats - alias pour getStudentStats (backward compatibility)
   */
  getUserStats(userId: number): Observable<UserStats> {
    return this.getStudentStats(userId);
  }

  /**
   * Get revenue statistics - ENDPOINT N'EXISTE PAS AU BACKEND
   * Retourne observable vide pour éviter les 404
   */
  getRevenueStats(): Observable<RevenueStats> {
    console.warn('getRevenueStats: endpoint /statistics/revenue n\'existe pas au backend');
    return new Observable((observer) => {
      observer.error(new Error('Revenue statistics endpoint not available'));
    });
  }
}

