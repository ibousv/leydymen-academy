import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ModalAction, ModalComponent } from '../../../shared/components/modal/modal.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ROUTES } from '../../../shared/constants';
import { AuthService, FormationService } from '../../../core/services';
import type {
  Formation,
  FormationFilters,
  FormationLevel,
  FormationSort,
  FormationStatus,
  User,
} from '../../../core/models';

const CATEGORIES = ['Développement Web', 'Data Science', 'DevOps', 'Cybersécurité', 'Mobile', 'Cloud'];

/**
 * FormationListComponent — liste des formations (spec §4.3.1).
 * Recherche, filtres (catégorie, niveau, prix, statut), tri,
 * bascule grille/liste, pagination et actions (détail, édition,
 * publication, suppression).
 */
@Component({
  selector: 'app-formation-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    InputComponent,
    ModalComponent,
    SelectComponent,
    SkeletonComponent,
  ],
  templateUrl: './formation-list.component.html',
  styleUrl: './formation-list.component.css',
})
export class FormationListComponent {
  private readonly authService = inject(AuthService);
  private readonly formationService = inject(FormationService);
  private readonly router = inject(Router);

  protected readonly ROUTES = ROUTES;
  protected readonly Math = Math;

  protected readonly user = signal<User | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly notice = signal('');

  protected readonly formations = signal<Formation[]>([]);
  protected readonly viewMode = signal<'grid' | 'list'>('grid');
  protected readonly page = signal(1);
  protected readonly pageSize = signal(9);

  protected readonly search = signal('');
  protected readonly category = signal('');
  protected readonly level = signal<FormationLevel | ''>('');
  protected readonly status = signal<FormationStatus | ''>('');
  protected readonly priceMin = signal('');
  protected readonly priceMax = signal('');
  protected readonly sort = signal<FormationSort>('relevance');

  protected readonly deleteTarget = signal<Formation | null>(null);
  protected readonly deleting = signal(false);

  protected readonly isStaff = computed(() => {
    const role = this.user()?.role;
    return role === 'ADMIN' || role === 'INSTRUCTOR';
  });

  protected readonly total = computed(() => this.formations().length);
  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  protected readonly pagedFormations = computed(() => {
    const formations = this.formations() ?? [];
    const start = (this.page() - 1) * this.pageSize();
    return formations.slice(start, start + this.pageSize());
  });
  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.pageCount() }, (_, index) => index + 1),
  );

  protected readonly deleteActions = computed<ModalAction[]>(() => [
    { label: 'Annuler', handler: () => this.cancelDelete() },
    { label: 'Supprimer', handler: () => this.confirmDelete() },
  ]);

  protected readonly categoryOptions: SelectOption[] = [
    { value: '', label: 'Toutes les catégories' },
    ...CATEGORIES.map((category) => ({ value: category, label: category })),
  ];

  protected readonly levelOptions: SelectOption[] = [
    { value: '', label: 'Tous les niveaux' },
    { value: 'debutant', label: 'Débutant' },
    { value: 'intermediaire', label: 'Intermédiaire' },
    { value: 'avance', label: 'Avancé' },
  ];

  protected readonly statusOptions: SelectOption[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'draft', label: 'Brouillon' },
    { value: 'published', label: 'Publié' },
    { value: 'archived', label: 'Archivé' },
  ];

  protected readonly sortOptions: SelectOption[] = [
    { value: 'relevance', label: 'Pertinence' },
    { value: 'newest', label: 'Plus récentes' },
    { value: 'price', label: 'Prix' },
    { value: 'rating', label: 'Note' },
  ];

  constructor() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user.set(user);
        this.reload();
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected reload(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.formationService.getFormations(this.buildFilters()).subscribe({
      next: (formations) => {
        this.formations.set(formations);
        this.page.set(1);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected onSearch(): void {
    this.reload();
  }

  protected onCategoryChange(value: unknown): void {
    this.category.set(value as string);
    this.reload();
  }

  protected onLevelChange(value: unknown): void {
    this.level.set(value as FormationLevel | '');
    this.reload();
  }

  protected onStatusChange(value: unknown): void {
    this.status.set(value as FormationStatus | '');
    this.reload();
  }

  protected onSortChange(value: unknown): void {
    this.sort.set(value as FormationSort);
    this.reload();
  }

  protected onPriceMinChange(value: string): void {
    this.priceMin.set(value);
    this.reload();
  }

  protected onPriceMaxChange(value: string): void {
    this.priceMax.set(value);
    this.reload();
  }

  protected setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  protected goToCreate(): void {
    this.router.navigate([ROUTES.formationsCreate]);
  }

  protected goToFormation(id: number): void {
    this.router.navigate([ROUTES.formationsDetail(id)]);
  }

  protected goToPage(nextPage: number): void {
    if (nextPage >= 1 && nextPage <= this.pageCount()) {
      this.page.set(nextPage);
    }
  }

  protected isCreator(formation: Formation): boolean {
    const user = this.user();
    return user?.role === 'ADMIN' || (user?.role === 'INSTRUCTOR' && formation.instructorId === user.id);
  }

  protected canDelete(formation: Formation): boolean {
    return this.user()?.role === 'ADMIN';
  }

  protected requestDelete(formation: Formation): void {
    this.deleteTarget.set(formation);
  }

  protected cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  protected confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) {
      return;
    }
    this.deleting.set(true);
    this.formationService.deleteFormation(target.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.showNotice('Formation supprimée.');
        this.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.handleActionError(error);
      },
    });
  }

  protected toggleStatus(formation: Formation): void {
    const nextStatus: FormationStatus = formation.status === 'published' ? 'draft' : 'published';
    this.formationService.updateFormation(formation.id, { status: nextStatus }).subscribe({
      next: () => {
        this.showNotice(
          nextStatus === 'published' ? 'Formation publiée.' : 'Formation dépubliée.',
        );
        this.reload();
      },
      error: (error: HttpErrorResponse) => this.handleActionError(error),
    });
  }

  protected levelLabel(level: FormationLevel): string {
    switch (level) {
      case 'debutant':
        return 'Débutant';
      case 'intermediaire':
        return 'Intermédiaire';
      case 'avance':
        return 'Avancé';
    }
  }

  protected statusLabel(status: FormationStatus): string {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'published':
        return 'Publié';
      case 'archived':
        return 'Archivé';
    }
  }

  protected statusVariant(status: FormationStatus): BadgeVariant {
    switch (status) {
      case 'draft':
        return 'neutral';
      case 'published':
        return 'success';
      case 'archived':
        return 'warning';
    }
  }

  protected formatPrice(value: number): string {
    return `${value.toLocaleString('fr-FR')} FCFA`;
  }

  private buildFilters(): FormationFilters {
    const priceMin = this.priceMin() === '' ? undefined : Number(this.priceMin());
    const priceMax = this.priceMax() === '' ? undefined : Number(this.priceMax());
    return {
      search: this.search() || undefined,
      category: this.category() || undefined,
      level: this.level() || undefined,
      status: this.status() || undefined,
      priceMin,
      priceMax,
      sort: this.sort(),
      page: 1,
      pageSize: 100,
    };
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
    this.errorMessage.set(body?.message ?? 'Impossible de charger les formations. Veuillez réessayer.');
    this.loading.set(false);
  }

  private handleActionError(error: HttpErrorResponse): void {
    const body = error.error as { message?: string } | null;
    this.showNotice(body?.message ?? 'Une erreur est survenue. Veuillez réessayer.');
  }
}
