import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ProgressComponent } from '../../../shared/components/progress/progress.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ROUTES } from '../../../shared/constants';
import { AuthService, EnrollmentService, FormationService } from '../../../core/services';
import type { Enrollment, Formation, FormationDetail, User } from '../../../core/models';

type DetailTab = 'overview' | 'curriculum' | 'reviews' | 'instructor';

/**
 * FormationDetailComponent — page de détail d'une formation (spec §4.3.2).
 * En-tête (image, titre, instructeur, note, effectif), onglets
 * (Aperçu, Programme, Avis, Instructeur), inscription pour les
 * étudiants non inscrits et bouton Continuer pour les inscrits.
 */
@Component({
  selector: 'app-formation-detail',
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
  templateUrl: './formation-detail.component.html',
  styleUrl: './formation-detail.component.css',
})
export class FormationDetailComponent {
  private readonly authService = inject(AuthService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly formationService = inject(FormationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly ROUTES = ROUTES;

  protected readonly user = signal<User | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly notice = signal('');

  protected readonly formation = signal<FormationDetail | null>(null);
  protected readonly enrollments = signal<Enrollment[]>([]);
  protected readonly otherFormations = signal<Formation[]>([]);

  protected readonly activeTab = signal<DetailTab>('overview');
  protected readonly enrolling = signal(false);

  protected readonly tabs: { id: DetailTab; label: string }[] = [
    { id: 'overview', label: 'Aperçu' },
    { id: 'curriculum', label: 'Programme' },
    { id: 'reviews', label: 'Avis' },
    { id: 'instructor', label: 'Instructeur' },
  ];

  protected readonly isStudent = computed(() => this.user()?.role === 'STUDENT');
  protected readonly isStaff = computed(() => {
    const role = this.user()?.role;
    return role === 'ADMIN' || role === 'INSTRUCTOR';
  });

  protected readonly enrollment = computed(() =>
    this.enrollments().find((enrollment) => enrollment.formationId === this.formation()?.id),
  );

  protected readonly isEnrolled = computed(() => this.enrollment() !== undefined);

  protected readonly shareLinks = computed(() => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const encodedUrl = encodeURIComponent(url);
    const title = encodeURIComponent(this.formation()?.title ?? 'LEYDYMEN Academy');
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${title}%20${encodedUrl}`,
    };
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const formationId = Number(params.get('id'));
      if (!Number.isInteger(formationId) || formationId <= 0) {
        this.errorMessage.set('Formation introuvable.');
        this.loading.set(false);
        return;
      }
      this.activeTab.set('overview');
      this.loadData(formationId);
    });
  }

  protected setTab(tab: DetailTab): void {
    this.activeTab.set(tab);
  }

  protected enroll(): void {
    const formation = this.formation();
    if (!formation) {
      return;
    }
    this.enrolling.set(true);
    this.enrollmentService.enrollFormation(formation.id).subscribe({
      next: (enrollment) => {
        this.enrolling.set(false);
        this.enrollments.set([...this.enrollments(), enrollment]);
        this.showNotice('Inscription réussie !');
      },
      error: (error: HttpErrorResponse) => {
        this.enrolling.set(false);
        this.handleActionError(error);
      },
    });
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

  protected statusLabel(status: string): string {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'published':
        return 'Publié';
      case 'archived':
        return 'Archivé';
      default:
        return status;
    }
  }

  protected statusVariant(status: string): BadgeVariant {
    switch (status) {
      case 'draft':
        return 'neutral';
      case 'published':
        return 'success';
      case 'archived':
        return 'warning';
      default:
        return 'neutral';
    }
  }

  protected formatPrice(value: number): string {
    return `${value.toLocaleString('fr-FR')} FCFA`;
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  protected goToFormation(id: number): void {
    this.router.navigate([ROUTES.formationsDetail(id)]);
  }

  private loadData(formationId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.authService
      .getCurrentUser()
      .pipe(
        switchMap((user) => {
          this.user.set(user);
          const enrollments$ =
            user.role === 'STUDENT'
              ? this.enrollmentService.getEnrollments({ studentId: user.id })
              : of([]);
          return forkJoin({
            formation: this.formationService.getFormation(formationId),
            enrollments: enrollments$,
            formations: this.formationService.getFormations({ page: 1, pageSize: 100 }),
          });
        }),
      )
      .subscribe({
        next: ({ formation, enrollments, formations }) => {
          this.formation.set(formation);
          this.enrollments.set(enrollments);
          this.otherFormations.set(
            formations
              .filter((item) => item.instructorId === formation.instructorId && item.id !== formation.id)
              .slice(0, 3),
          );
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => this.handleError(error),
      });
  }

  private noticeTimeout: ReturnType<typeof setTimeout> | undefined;

  private showNotice(message: string): void {
    this.notice.set(message);
    if (this.noticeTimeout !== undefined) {
      clearTimeout(this.noticeTimeout);
    }
    this.noticeTimeout = setTimeout(() => this.notice.set(''), 3000);
  }

  private handleError(error: HttpErrorResponse): void {
    const body = error.error as { message?: string } | null;
    this.errorMessage.set(body?.message ?? 'Impossible de charger la formation. Veuillez réessayer.');
    this.loading.set(false);
  }

  private handleActionError(error: HttpErrorResponse): void {
    const body = error.error as { message?: string } | null;
    this.showNotice(body?.message ?? 'Une erreur est survenue. Veuillez réessayer.');
  }
}
