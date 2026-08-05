import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CardComponent } from '../../../shared/components/card/card.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ProgressComponent } from '../../../shared/components/progress/progress.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { ROUTES, FORMATION_LEVELS } from '../../../shared/constants';
import { EnrollmentService, FormationService } from '../../../core/services';
import type { Enrollment, Formation, FormationLevel } from '../../../core/models';

type CourseTab = 'in_progress' | 'completed';
type CourseSort = 'recent' | 'alphabetical' | 'progress';

/** Liste de mes cours (spec §4.6.1). */
@Component({
  selector: 'app-my-courses-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CardComponent, InputComponent, ProgressComponent, SelectComponent],
  templateUrl: './my-courses-list.component.html',
  styleUrl: './my-courses-list.component.css',
})
export class MyCoursesListComponent {
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly formationService = inject(FormationService);

  protected readonly ROUTES = ROUTES;

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');

  protected readonly tabs = [
    { value: 'in_progress' as CourseTab, label: 'En cours' },
    { value: 'completed' as CourseTab, label: 'Terminés' },
  ];
  protected readonly activeTab = signal<CourseTab>('in_progress');

  protected readonly enrollments = signal<Enrollment[]>([]);
  protected readonly sort = signal<CourseSort>('recent');
  protected readonly search = signal('');
  protected readonly sortOptions: SelectOption[] = [
    { value: 'recent', label: 'Récents' },
    { value: 'alphabetical', label: 'Alphabétique' },
    { value: 'progress', label: 'Progression' },
  ];

  protected readonly formations = signal<Formation[]>([]);

  protected readonly enrolledFormationIds = computed(() => new Set(this.enrollments().map((e) => e.formationId)));
  protected readonly recommendedFormations = computed(() =>
    this.formations().filter((formation) => !this.enrolledFormationIds().has(formation.id)).slice(0, 3),
  );

  protected readonly filteredEnrollments = computed(() => {
    const keyword = this.search().trim().toLowerCase();
    return this.enrollments().filter(
      (enrollment) =>
        enrollment.status === this.activeTab() &&
        (keyword === '' || this.formationTitle(enrollment).toLowerCase().includes(keyword)),
    );
  });
  protected readonly sortedEnrollments = computed(() => {
    const sorted = [...this.filteredEnrollments()];
    switch (this.sort()) {
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

  constructor() {
    forkJoin({
      enrollments: this.enrollmentService.getEnrollments(),
      formations: this.formationService.getFormations({ status: 'published', page: 1, pageSize: 100 }),
    }).subscribe({
      next: ({ enrollments, formations }) => {
        this.enrollments.set(enrollments);
        this.formations.set(formations);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
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

  protected setTab(tab: CourseTab): void {
    this.activeTab.set(tab);
  }

  protected onSortChange(value: unknown): void {
    this.sort.set(value as CourseSort);
  }

  protected onSearchChange(value: string): void {
    this.search.set(value);
  }

  private handleError(error: HttpErrorResponse): void {
    this.loading.set(false);
    const body = error.error as { message?: string } | null;
    this.errorMessage.set(body?.message ?? 'Impossible de charger vos cours. Veuillez réessayer.');
  }
}
