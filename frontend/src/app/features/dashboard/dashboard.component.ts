import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { BadgeComponent, BadgeVariant } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ProgressComponent } from '../../shared/components/progress/progress.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { ROUTES } from '../../shared/constants';
import { AuthService, EnrollmentService, FormationService, StatisticsService } from '../../core/services';
import type {
  DashboardStats,
  Enrollment,
  EnrollmentStatus,
  Formation,
  MonthCount,
  User,
  UserStats,
} from '../../core/models';

interface InstructorFormationStat {
  formation: Formation;
  students: number;
  completed: number;
  completionRate: number;
}

interface StudentPerformance {
  student: User;
  avgCompletion: number;
}

/**
 * DashboardComponent — page d'accueil connectée (spec §4.2).
 * Vue adaptative selon le rôle : KPIs, activité récente, graphiques,
 * top formations (ADMIN) ; formations, inscriptions récentes,
 * performance des étudiants (INSTRUCTOR) ; cours en cours, recommandations,
 * statistiques d'apprentissage (STUDENT).
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    ProgressComponent,
    SkeletonComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly formationService = inject(FormationService);
  private readonly statisticsService = inject(StatisticsService);
  private readonly router = inject(Router);

  protected readonly ROUTES = ROUTES;

  protected readonly user = signal<User | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');

  protected readonly adminStats = signal<DashboardStats | null>(null);

  protected readonly instructorFormations = signal<InstructorFormationStat[]>([]);
  protected readonly instructorRecentEnrollments = signal<Enrollment[]>([]);
  protected readonly instructorStudents = signal<StudentPerformance[]>([]);
  protected readonly instructorTrend = signal<MonthCount[]>([]);

  protected readonly studentEnrollments = signal<Enrollment[]>([]);
  protected readonly studentStats = signal<UserStats | null>(null);
  protected readonly recommendedFormations = signal<Formation[]>([]);

  protected readonly studentInProgress = computed(() =>
    this.studentEnrollments().filter((enrollment) => enrollment.status === 'in_progress'),
  );

  protected readonly instructorStats = computed(() => {
    const formations = this.instructorFormations();
    const studentCount = new Set(this.instructorRecentEnrollments().map((e) => e.studentId)).size;
    const averageCompletion =
      formations.length === 0
        ? 0
        : Math.round(formations.reduce((sum, stat) => sum + stat.completionRate, 0) / formations.length);
    return { formations: formations.length, students: studentCount, completionRate: averageCompletion };
  });

  protected readonly maxEnrollments = computed(() =>
    Math.max(1, ...(this.adminStats()?.enrollmentsOverTime ?? []).map((point) => point.count)),
  );

  protected readonly maxLevelCount = computed(() =>
    Math.max(1, ...(this.adminStats()?.studentDistribution ?? []).map((point) => point.count)),
  );

  protected readonly maxRevenue = computed(() =>
    Math.max(1, ...(this.adminStats()?.revenueByFormation ?? []).map((item) => item.revenue)),
  );

  protected readonly maxInstructorTrend = computed(() =>
    Math.max(1, ...this.instructorTrend().map((point) => point.count)),
  );

  constructor() {
    this.loadDashboard();
  }

  protected reload(): void {
    this.loadDashboard();
  }

  protected goToFormation(id: number): void {
    this.router.navigate([ROUTES.formationsDetail(id)]);
  }

  protected barPercent(value: number, max: number): number {
    return max === 0 ? 0 : Math.round((value / max) * 100);
  }

  protected formatPrice(value: number): string {
    return `${value.toLocaleString('fr-FR')} FCFA`;
  }

  protected formationInstructorLabel(formation: Formation | undefined): string {
    if (!formation) {
      return '';
    }
    return `${formation.instructor.firstName} ${formation.instructor.lastName} · ${this.levelLabel(formation.level)}`;
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  protected formatMonth(month: string): string {
    const [year, monthIndex] = month.split('-');
    const months = [
      'janv.',
      'févr.',
      'mars',
      'avr.',
      'mai',
      'juin',
      'juil.',
      'août',
      'sept.',
      'oct.',
      'nov.',
      'déc.',
    ];
    const index = Number(monthIndex) - 1;
    return `${months[index] ?? month} ${year}`;
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

  protected statusLabel(status: EnrollmentStatus): string {
    switch (status) {
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'dropped':
        return 'Abandonné';
    }
  }

  protected statusVariant(status: EnrollmentStatus): BadgeVariant {
    switch (status) {
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'dropped':
        return 'error';
    }
  }

  protected nameInitials(user: User): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user.set(user);
        this.loadRoleData(user);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  private loadRoleData(user: User): void {
    switch (user.role) {
      case 'ADMIN':
        this.loadAdminData();
        break;
      case 'INSTRUCTOR':
        this.loadInstructorData(user);
        break;
      case 'STUDENT':
        this.loadStudentData(user);
        break;
    }
  }

  private loadAdminData(): void {
    this.statisticsService.getDashboardStats().subscribe({
      next: (stats) => {
        this.adminStats.set(stats);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  private loadInstructorData(user: User): void {
    this.enrollmentService.getEnrollments().subscribe({
      next: (enrollments) => {
        const mine = enrollments.filter((enrollment) => enrollment.formation?.instructorId === user.id);
        this.instructorFormations.set(this.buildInstructorFormations(mine));
        this.instructorRecentEnrollments.set(
          [...mine].sort((a, b) => b.enrollmentDate.localeCompare(a.enrollmentDate)).slice(0, 5),
        );
        this.instructorStudents.set(this.buildStudentPerformance(mine));
        this.instructorTrend.set(this.buildMonthlyTrend(mine));
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  private loadStudentData(user: User): void {
    forkJoin({
      enrollments: this.enrollmentService.getEnrollments({ studentId: user.id }),
      stats: this.statisticsService.getUserStats(user.id),
      formations: this.formationService.getFormations({ status: 'published' }),
    }).subscribe({
      next: ({ enrollments, stats, formations }) => {
        this.studentEnrollments.set(enrollments);
        this.studentStats.set(stats);
        const enrolledIds = new Set(enrollments.map((enrollment) => enrollment.formationId));
        this.recommendedFormations.set(formations.filter((formation) => !enrolledIds.has(formation.id)).slice(0, 4));
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  private buildInstructorFormations(enrollments: Enrollment[]): InstructorFormationStat[] {
    const byFormation = new Map<number, InstructorFormationStat>();
    for (const enrollment of enrollments) {
      if (!enrollment.formation) {
        continue;
      }
      let stat = byFormation.get(enrollment.formationId);
      if (!stat) {
        stat = { formation: enrollment.formation, students: 0, completed: 0, completionRate: 0 };
        byFormation.set(enrollment.formationId, stat);
      }
      stat.students += 1;
      if (enrollment.status === 'completed') {
        stat.completed += 1;
      }
    }
    for (const stat of byFormation.values()) {
      stat.completionRate = stat.students === 0 ? 0 : Math.round((stat.completed / stat.students) * 100);
    }
    return [...byFormation.values()].sort((a, b) => b.students - a.students);
  }

  private buildStudentPerformance(enrollments: Enrollment[]): StudentPerformance[] {
    const byStudent = new Map<number, { student: User; total: number; sum: number }>();
    for (const enrollment of enrollments) {
      if (!enrollment.student) {
        continue;
      }
      const entry = byStudent.get(enrollment.studentId) ?? {
        student: enrollment.student,
        total: 0,
        sum: 0,
      };
      entry.total += 1;
      entry.sum += enrollment.completionPercent;
      byStudent.set(enrollment.studentId, entry);
    }
    return [...byStudent.values()]
      .map((entry) => ({ student: entry.student, avgCompletion: Math.round(entry.sum / entry.total) }))
      .sort((a, b) => b.avgCompletion - a.avgCompletion);
  }

  private buildMonthlyTrend(enrollments: Enrollment[]): MonthCount[] {
    const byMonth = new Map<string, number>();
    for (const enrollment of enrollments) {
      const month = enrollment.enrollmentDate.slice(0, 7);
      byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
    }
    return [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  }

  private handleError(error: HttpErrorResponse): void {
    const body = error.error as { message?: string } | null;
    this.errorMessage.set(body?.message ?? 'Impossible de charger le tableau de bord. Veuillez réessayer.');
    this.loading.set(false);
  }
}
