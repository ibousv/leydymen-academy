import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { FORMATION_CATEGORIES, FORMATION_STATUS, ROUTES } from '../../../shared/constants';
import { FormationService } from '../../../core/services';
import type { Formation, FormationStatus } from '../../../core/models';

/** Gestion des formations (spec §4.8.3). */
@Component({
  selector: 'app-admin-formations',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, InputComponent, SelectComponent],
  templateUrl: './admin-formations.component.html',
  styleUrl: './admin-formations.component.css',
})
export class AdminFormationsComponent {
  private readonly formationService = inject(FormationService);

  protected readonly ROUTES = ROUTES;

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly notice = signal('');

  protected readonly formations = signal<Formation[]>([]);
  protected readonly search = signal('');
  protected readonly statusFilter = signal<FormationStatus | ''>('');
  protected readonly categoryFilter = signal('');
  protected readonly selectedIds = signal<Set<number>>(new Set());
  protected readonly bulkStatus = signal<FormationStatus | ''>('');
  protected readonly allChecked = signal(false);

  protected readonly statusOptions: SelectOption[] = FORMATION_STATUS.map((entry) => ({
    value: entry.value,
    label: entry.label,
  }));
  protected readonly categoryOptions: SelectOption[] = FORMATION_CATEGORIES.map((category) => ({
    value: category,
    label: category,
  }));
  protected readonly bulkStatusOptions: SelectOption[] = this.statusOptions;

  protected readonly filteredFormations = computed(() => {
    const keyword = this.search().trim().toLowerCase();
    return this.formations().filter((formation) => {
      const matchesSearch = keyword === '' || formation.title.toLowerCase().includes(keyword);
      const matchesStatus = this.statusFilter() === '' || formation.status === this.statusFilter();
      const matchesCategory = this.categoryFilter() === '' || formation.category === this.categoryFilter();
      return matchesSearch && matchesStatus && matchesCategory;
    });
  });

  constructor() {
    this.loadFormations();
  }

  protected loadFormations(): void {
    this.loading.set(true);
    this.formationService.getFormations({ page: 1, pageSize: 100 }).subscribe({
      next: (formations) => {
        this.formations.set(formations);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected onSearchChange(value: string): void {
    this.search.set(value);
  }

  protected onStatusFilterChange(value: unknown): void {
    this.statusFilter.set(value as FormationStatus | '');
  }

  protected onCategoryFilterChange(value: unknown): void {
    this.categoryFilter.set(value as string);
  }

  protected onBulkStatusChange(value: unknown): void {
    this.bulkStatus.set(value as FormationStatus | '');
  }

  protected toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const ids = new Set(checked ? this.filteredFormations().map((formation) => formation.id) : []);
    this.selectedIds.set(ids);
    this.allChecked.set(checked);
  }

  protected toggleFormation(formationId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const ids = new Set(this.selectedIds());
    if (checked) {
      ids.add(formationId);
    } else {
      ids.delete(formationId);
    }
    this.selectedIds.set(ids);
    this.allChecked.set(ids.size === this.filteredFormations().length && this.filteredFormations().length > 0);
  }

  protected isSelected(formationId: number): boolean {
    return this.selectedIds().has(formationId);
  }

  protected selectedFormations(): Formation[] {
    return this.formations().filter((formation) => this.selectedIds().has(formation.id));
  }

  protected setStatus(formation: Formation, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as FormationStatus;
    this.formationService.updateFormation(formation.id, { status }).subscribe({
      next: (updated) => {
        this.notice.set(`Statut de « ${updated.title} » mis à jour.`);
        this.replaceFormation(updated);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected deleteFormation(formation: Formation): void {
    this.formationService.deleteFormation(formation.id).subscribe({
      next: () => {
        this.notice.set(`Formation « ${formation.title} » supprimée.`);
        this.formations.update((formations) => formations.filter((entry) => entry.id !== formation.id));
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected applyBulkStatus(): void {
    const status = this.bulkStatus();
    if (!status || this.selectedIds().size === 0) {
      return;
    }
    for (const formation of this.selectedFormations()) {
      this.formationService.updateFormation(formation.id, { status }).subscribe({
        next: (updated) => this.replaceFormation(updated),
        error: (error: HttpErrorResponse) => this.handleError(error),
      });
    }
    this.notice.set(`${this.selectedIds().size} formation(s) mise(s) à jour.`);
    this.selectedIds.set(new Set());
    this.allChecked.set(false);
  }

  protected deleteSelected(): void {
    if (this.selectedIds().size === 0) {
      return;
    }
    for (const formation of this.selectedFormations()) {
      this.formationService.deleteFormation(formation.id).subscribe({
        next: () => {
          this.formations.update((formations) => formations.filter((entry) => entry.id !== formation.id));
        },
        error: (error: HttpErrorResponse) => this.handleError(error),
      });
    }
    this.notice.set(`${this.selectedIds().size} formation(s) supprimée(s).`);
    this.selectedIds.set(new Set());
    this.allChecked.set(false);
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  protected statusLabel(status: FormationStatus): string {
    return FORMATION_STATUS.find((entry) => entry.value === status)?.label ?? status;
  }

  protected formatCurrency(value: number): string {
    return `${value.toLocaleString('fr-FR')} FCFA`;
  }

  private replaceFormation(updated: Formation): void {
    this.formations.update((formations) =>
      formations.map((formation) => (formation.id === updated.id ? updated : formation)),
    );
  }

  private handleError(error: HttpErrorResponse): void {
    this.loading.set(false);
    const body = error.error as { message?: string } | null;
    this.errorMessage.set(body?.message ?? 'Une erreur est survenue. Veuillez réessayer.');
  }
}
