import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ProgressComponent, ProgressVariant } from '../../../shared/components/progress/progress.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { ROUTES, FORMATION_LEVELS } from '../../../shared/constants';
import { AuthService, EnrollmentService, FormationService } from '../../../core/services';
import type { Enrollment, EnrollmentStatus, Formation, FormationLevel, UserRole } from '../../../core/models';

type StudentSort = 'recent' | 'alphabetical' | 'progress';

const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  in_progress: 'En cours',
  completed: 'Terminée',
  dropped: 'Abandonnée',
};

const STATUS_VARIANTS: Record<EnrollmentStatus, BadgeVariant> = {
  in_progress: 'primary',
  completed: 'success',
  dropped: 'error',
};

const PROGRESS_VARIANTS: Record<EnrollmentStatus, ProgressVariant> = {
  in_progress: 'primary',
  completed: 'success',
  dropped: 'error',
};

/** Liste des inscriptions (spec §4.5.1 vue étudiant, §4.5.2 vue staff). */
@Component({
  selector: 'app-enrollment-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BadgeComponent, ButtonComponent, CardComponent, ProgressComponent, SelectComponent],
  templateUrl: './enrollment-list.component.html',
  styleUrl: './enrollment-list.component.css',
})
export class EnrollmentListComponent {
  private readonly authService = inject(AuthService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly formationService = inject(FormationService);

  protected readonly ROUTES = ROUTES;

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly notice = signal('');
  protected readonly role = signal<UserRole | null>(null);

  protected readonly tabs = [
    { value: 'in_progress' as EnrollmentStatus, label: 'En cours' },
    { value: 'completed' as EnrollmentStatus, label: 'Terminées' },
    { value: 'dropped' as EnrollmentStatus, label: 'Abandonnées' },
  ];
  protected readonly activeTab = signal<EnrollmentStatus>('in_progress');

  protected readonly studentEnrollments = signal<Enrollment[]>([]);
  protected readonly studentSort = signal<StudentSort>('recent');
  protected readonly studentSortOptions: SelectOption[] = [
    { value: 'recent', label: 'Récents' },
    { value: 'alphabetical', label: 'Alphabétique' },
    { value: 'progress', label: 'Progression' },
  ];

  protected readonly formations = signal<Formation[]>([]);
  protected readonly selectedFormationId = signal<number | null>(null);
  protected readonly staffEnrollments = signal<Enrollment[]>([]);
  protected readonly staffStatus = signal<EnrollmentStatus | ''>('');
  protected readonly selectedIds = signal<Set<number>>(new Set());
  protected readonly bulkStatus = signal<EnrollmentStatus | ''>('');
  protected readonly bulkApplying = signal(false);

  protected readonly staffStatusOptions: SelectOption[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'completed', label: 'Terminée' },
    { value: 'dropped', label: 'Abandonnée' },
  ];
  protected readonly bulkStatusOptions: SelectOption[] = [
    { value: '', label: 'Changer le statut…' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'completed', label: 'Terminée' },
    { value: 'dropped', label: 'Abandonnée' },
  ];

  protected readonly formationOptions = computed<SelectOption[]>(() =>
    this.formations().map((formation) => ({ value: formation.id, label: formation.title })),
  );

  protected readonly tabEnrollments = computed(() =>
    this.studentEnrollments().filter((enrollment) => enrollment.status === this.activeTab()),
  );
  protected readonly sortedEnrollments = computed(() => {
    const sorted = [...this.tabEnrollments()];
    switch (this.studentSort()) {
      case 'alphabetical':
        sorted.sort((a, b) => this.formationTitle(a).localeCompare(this.formationTitle(b)));
        break;
      case 'progress':
        sorted.sort((a, b) => b.completionPercent - a.completionPercent);
        break;
      default:
        sorted.sort((a, b) => b.enrollmentDate.localeCompare(a.enrollmentDate));
    }
    return sorted;
  });
  protected readonly selectedEnrollments = computed(() => {
    const ids = this.selectedIds();
    return this.staffEnrollments().filter((enrollment) => ids.has(enrollment.id));
  });

  constructor() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.role.set(user.role);
        if (user.role === 'STUDENT') {
          this.loadStudentEnrollments();
        } else {
          this.loadFormations();
        }
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected statusLabel(status: EnrollmentStatus): string {
    return STATUS_LABELS[status];
  }

  protected statusVariant(status: EnrollmentStatus): BadgeVariant {
    return STATUS_VARIANTS[status];
  }

  protected progressVariant(status: EnrollmentStatus): ProgressVariant {
    return PROGRESS_VARIANTS[status];
  }

  protected formationTitle(enrollment: Enrollment): string {
    return enrollment.formation?.title ?? `Formation #${enrollment.formationId}`;
  }

  protected formationSubtitle(formation: Formation | undefined): string {
    if (!formation) {
      return '';
    }
    return `${formation.instructor.firstName} ${formation.instructor.lastName} · ${this.levelLabel(formation.level)}`;
  }

  protected levelLabel(level: FormationLevel): string {
    return FORMATION_LEVELS.find((entry) => entry.value === level)?.label ?? level;
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  protected formatGrade(enrollment: Enrollment): string {
    return enrollment.grade == null ? '—' : `${enrollment.grade}/20`;
  }

  protected studentFullName(enrollment: Enrollment): string {
    return enrollment.student
      ? `${enrollment.student.firstName} ${enrollment.student.lastName}`
      : `Étudiant #${enrollment.studentId}`;
  }

  protected setTab(tab: EnrollmentStatus): void {
    this.activeTab.set(tab);
  }

  protected onStudentSortChange(value: unknown): void {
    this.studentSort.set(value as StudentSort);
  }

  protected dropCourse(enrollment: Enrollment): void {
    if (enrollment.status !== 'in_progress') {
      return;
    }
    this.enrollmentService.updateEnrollmentStatus(enrollment.id, 'dropped').subscribe({
      next: () => {
        this.notice.set(`Vous avez abandonné « ${this.formationTitle(enrollment)} ».`);
        this.loadStudentEnrollments();
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected onFormationChange(value: unknown): void {
    this.selectedFormationId.set(Number(value));
    this.staffStatus.set('');
    this.selectedIds.set(new Set());
    this.loadStaffEnrollments();
  }

  protected onStaffStatusChange(value: unknown): void {
    this.staffStatus.set(value as EnrollmentStatus | '');
    this.selectedIds.set(new Set());
    this.loadStaffEnrollments();
  }

  protected onBulkStatusChange(value: unknown): void {
    this.bulkStatus.set(value as EnrollmentStatus | '');
  }

  protected markAsCompleted(enrollment: Enrollment): void {
    if (enrollment.status === 'completed') {
      return;
    }
    this.enrollmentService.updateEnrollmentStatus(enrollment.id, 'completed').subscribe({
      next: () => {
        this.notice.set(`L'inscription de ${this.studentFullName(enrollment)} a été marquée comme terminée.`);
        this.loadStaffEnrollments();
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected dropEnrollment(enrollment: Enrollment): void {
    if (enrollment.status === 'dropped') {
      return;
    }
    this.enrollmentService.updateEnrollmentStatus(enrollment.id, 'dropped').subscribe({
      next: () => {
        this.notice.set(`L'inscription de ${this.studentFullName(enrollment)} a été abandonnée.`);
        this.loadStaffEnrollments();
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected toggleEnrollment(enrollmentId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const ids = new Set(this.selectedIds());
    if (checked) {
      ids.add(enrollmentId);
    } else {
      ids.delete(enrollmentId);
    }
    this.selectedIds.set(ids);
  }

  protected toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const ids = new Set(this.selectedIds());
    for (const enrollment of this.staffEnrollments()) {
      if (checked) {
        ids.add(enrollment.id);
      } else {
        ids.delete(enrollment.id);
      }
    }
    this.selectedIds.set(ids);
  }

  protected applyBulkStatus(): void {
    const status = this.bulkStatus();
    const ids = [...this.selectedIds()];
    if (!status || ids.length === 0 || this.bulkApplying()) {
      return;
    }
    this.bulkApplying.set(true);
    let done = 0;
    for (const id of ids) {
      this.enrollmentService.updateEnrollmentStatus(id, status).subscribe({
        next: () => {
          done += 1;
          if (done === ids.length) {
            this.bulkApplying.set(false);
            this.notice.set(`Statut mis à jour pour ${ids.length} inscription(s).`);
            this.selectedIds.set(new Set());
            this.bulkStatus.set('');
            this.loadStaffEnrollments();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.bulkApplying.set(false);
          this.handleError(error);
        },
      });
    }
  }

  protected exportCsv(): void {
    const rows = [
      ['Étudiant', 'Formation', "Date d'inscription", 'Progression', 'Note', 'Statut'],
      ...this.selectedEnrollments().map((enrollment) => [
        this.studentFullName(enrollment),
        this.formationTitle(enrollment),
        this.formatDate(enrollment.enrollmentDate),
        `${enrollment.completionPercent}%`,
        this.formatGrade(enrollment),
        STATUS_LABELS[enrollment.status],
      ]),
    ];
    this.downloadCsv(rows, 'inscriptions.csv');
  }

  private loadStudentEnrollments(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.enrollmentService.getEnrollments().subscribe({
      next: (enrollments) => {
        this.studentEnrollments.set(enrollments);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  private loadFormations(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.formationService.getFormations({ page: 1, pageSize: 100 }).subscribe({
      next: (formations) => {
        this.formations.set(formations);
        if (formations.length > 0) {
          this.selectedFormationId.set(formations[0].id);
          this.loadStaffEnrollments();
        } else {
          this.loading.set(false);
        }
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  private loadStaffEnrollments(): void {
    const formationId = this.selectedFormationId();
    if (formationId === null) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    this.enrollmentService
      .getEnrollments({ formationId, status: this.staffStatus() || undefined })
      .subscribe({
        next: (enrollments) => {
          this.staffEnrollments.set(enrollments);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => this.handleError(error),
      });
  }

  private handleError(error: HttpErrorResponse): void {
    this.loading.set(false);
    const body = error.error as { message?: string } | null;
    this.errorMessage.set(body?.message ?? 'Impossible de charger les inscriptions. Veuillez réessayer.');
  }

  private downloadCsv(rows: string[][], filename: string): void {
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
