import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';
import type { DashboardStats, FormationStats, RevenueStats, UserStats } from '../models';

/**
 * StatisticsService — API des statistiques (spec §6.6).
 */
@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(AppConfigService).apiUrl;

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/statistics/dashboard`);
  }

  getFormationStats(formationId: number): Observable<FormationStats> {
    return this.http.get<FormationStats>(`${this.apiUrl}/statistics/formation/${formationId}`);
  }

  getUserStats(userId: number): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/statistics/user/${userId}`);
  }

  getRevenueStats(): Observable<RevenueStats> {
    return this.http.get<RevenueStats>(`${this.apiUrl}/statistics/revenue`);
  }
}
