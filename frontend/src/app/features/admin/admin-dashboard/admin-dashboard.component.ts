import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { StatisticsService } from '../../../core/services';
import type { DashboardStats } from '../../../core/models';

/** Tableau de bord d'administration (spec §4.8.1). */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  private readonly statisticsService = inject(StatisticsService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly stats = signal<DashboardStats | null>(null);

  protected readonly growthRate = computed(() => {
    const series = this.stats()?.enrollmentsOverTime ?? [];
    if (series.length < 2) {
      return 0;
    }
    const previous = series[series.length - 2].count;
    const current = series[series.length - 1].count;
    if (previous <= 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  });

  protected readonly maxEnrollmentCount = computed(() =>
    Math.max(1, ...(this.stats()?.enrollmentsOverTime ?? []).map((entry) => entry.count)),
  );

  protected readonly maxRevenue = computed(() =>
    Math.max(1, ...(this.stats()?.revenueByFormation ?? []).map((entry) => entry.revenue)),
  );

  protected readonly maxTopFormations = computed(() =>
    Math.max(1, ...(this.stats()?.topFormations ?? []).map((entry) => entry.enrollments)),
  );

  protected readonly chartHeight = computed(() => this.stats()?.enrollmentsOverTime.length ?? 0);

  protected readonly barWidth = computed(() => {
    const count = this.chartHeight();
    return count > 0 ? `${100 / count}%` : '0%';
  });

  constructor() {
    this.statisticsService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
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
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }

  private handleError(error: HttpErrorResponse): void {
    this.loading.set(false);
    const body = error.error as { message?: string } | null;
    this.errorMessage.set(body?.message ?? 'Impossible de charger les statistiques. Veuillez réessayer.');
  }
}
