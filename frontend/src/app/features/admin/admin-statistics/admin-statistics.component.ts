import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { StatisticsService } from '../../../core/services';
import type { DashboardStats, RevenueStats } from '../../../core/models';

/** Statistiques et rapports (spec §4.8.4). */
@Component({
  selector: 'app-admin-statistics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-statistics.component.html',
  styleUrl: './admin-statistics.component.css',
})
export class AdminStatisticsComponent {
  private readonly statisticsService = inject(StatisticsService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly dashboard = signal<DashboardStats | null>(null);
  protected readonly revenue = signal<RevenueStats | null>(null);

  protected readonly maxTrendRevenue = computed(() =>
    Math.max(1, ...(this.revenue()?.revenueTrend ?? []).map((entry) => entry.revenue)),
  );

  protected readonly maxFormationRevenue = computed(() =>
    Math.max(1, ...(this.revenue()?.revenueByFormation ?? []).map((entry) => entry.revenue)),
  );

  protected readonly maxEnrollments = computed(() =>
    Math.max(1, ...(this.dashboard()?.topFormations ?? []).map((entry) => entry.enrollments)),
  );

  protected readonly maxLevelCount = computed(() =>
    Math.max(1, ...(this.dashboard()?.studentDistribution ?? []).map((entry) => entry.count)),
  );

  constructor() {
    forkJoin({
      dashboard: this.statisticsService.getDashboardStats(),
      revenue: this.statisticsService.getRevenueStats(),
    }).subscribe({
      next: ({ dashboard, revenue }) => {
        this.dashboard.set(dashboard);
        this.revenue.set(revenue);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected formatCurrency(value: number): string {
    return `${value.toLocaleString('fr-FR')} FCFA`;
  }

  protected formatMonth(month: string): string {
    return month;
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  protected roleLabel(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'INSTRUCTOR':
        return 'Instructeur';
      default:
        return 'Étudiant';
    }
  }

  protected levelLabel(level: string): string {
    switch (level) {
      case 'debutant':
        return 'Débutant';
      case 'intermediaire':
        return 'Intermédiaire';
      case 'avance':
        return 'Avancé';
      default:
        return level;
    }
  }

  private handleError(error: HttpErrorResponse): void {
    this.loading.set(false);
    const body = error.error as { message?: string } | null;
    this.errorMessage.set(body?.message ?? 'Impossible de charger les statistiques. Veuillez réessayer.');
  }
}
