import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { ROUTES } from '../../../shared/constants';
import { StatisticsService, UserService } from '../../../core/services';
import type { User, UserRole, UserStats, UserStatus } from '../../../core/models';

/** Gestion des utilisateurs (spec §4.8.2). */
@Component({
  selector: 'app-admin-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, InputComponent, SelectComponent],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent {
  private readonly userService = inject(UserService);
  private readonly statisticsService = inject(StatisticsService);

  protected readonly ROUTES = ROUTES;

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly notice = signal('');

  protected readonly users = signal<User[]>([]);
  protected readonly search = signal('');
  protected readonly roleFilter = signal<UserRole | ''>('');
  protected readonly statusFilter = signal<UserStatus | ''>('');
  protected readonly selectedIds = signal<Set<number>>(new Set());
  protected readonly bulkRole = signal<UserRole | ''>('');
  protected readonly allChecked = signal(false);

  protected readonly roleOptions: SelectOption[] = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'INSTRUCTOR', label: 'Instructeur' },
    { value: 'STUDENT', label: 'Étudiant' },
  ];
  protected readonly statusOptions: SelectOption[] = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'banned', label: 'Banni' },
  ];
  protected readonly bulkRoleOptions: SelectOption[] = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'INSTRUCTOR', label: 'Instructeur' },
    { value: 'STUDENT', label: 'Étudiant' },
  ];

  protected readonly activityUser = signal<User | null>(null);
  protected readonly activityStats = signal<UserStats | null>(null);
  protected readonly activityLoading = signal(false);

  protected readonly filteredUsers = computed(() => {
    const keyword = this.search().trim().toLowerCase();
    return this.users().filter((user) => {
      const matchesSearch =
        keyword === '' ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword);
      const matchesRole = this.roleFilter() === '' || user.role === this.roleFilter();
      const matchesStatus = this.statusFilter() === '' || user.status === this.statusFilter();
      return matchesSearch && matchesRole && matchesStatus;
    });
  });

  constructor() {
    this.loadUsers();
  }

  protected loadUsers(): void {
    this.loading.set(true);
    this.userService.getUsers({ page: 1, pageSize: 100 }).subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected onSearchChange(value: string): void {
    this.search.set(value);
  }

  protected onRoleFilterChange(value: unknown): void {
    this.roleFilter.set(value as UserRole | '');
  }

  protected onStatusFilterChange(value: unknown): void {
    this.statusFilter.set(value as UserStatus | '');
  }

  protected onBulkRoleChange(value: unknown): void {
    this.bulkRole.set(value as UserRole | '');
  }

  protected toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const ids = new Set(checked ? this.filteredUsers().map((user) => user.id) : []);
    this.selectedIds.set(ids);
    this.allChecked.set(checked);
  }

  protected toggleUser(userId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const ids = new Set(this.selectedIds());
    if (checked) {
      ids.add(userId);
    } else {
      ids.delete(userId);
    }
    this.selectedIds.set(ids);
    this.allChecked.set(ids.size === this.filteredUsers().length && this.filteredUsers().length > 0);
  }

  protected isSelected(userId: number): boolean {
    return this.selectedIds().has(userId);
  }

  protected selectedUsers(): User[] {
    return this.users().filter((user) => this.selectedIds().has(user.id));
  }

  protected changeRole(user: User, event: Event): void {
    const role = (event.target as HTMLSelectElement).value as UserRole;
    this.userService.updateUser(user.id, { role }).subscribe({
      next: (updated) => {
        this.notice.set(`Rôle de ${updated.firstName} ${updated.lastName} mis à jour.`);
        this.replaceUser(updated);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected setStatus(user: User, status: UserStatus): void {
    this.userService.updateUser(user.id, { status }).subscribe({
      next: (updated) => {
        const label = status === 'banned' ? 'banni' : 'désactivé';
        this.notice.set(`${updated.firstName} ${updated.lastName} ${label}.`);
        this.replaceUser(updated);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected deleteUser(user: User): void {
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.notice.set(`${user.firstName} ${user.lastName} supprimé.`);
        this.users.update((users) => users.filter((entry) => entry.id !== user.id));
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected applyBulkRole(): void {
    const role = this.bulkRole();
    if (!role || this.selectedIds().size === 0) {
      return;
    }
    for (const user of this.selectedUsers()) {
      this.userService.updateUser(user.id, { role }).subscribe({
        next: (updated) => this.replaceUser(updated),
        error: (error: HttpErrorResponse) => this.handleError(error),
      });
    }
    this.notice.set(`${this.selectedIds().size} utilisateur(s) mis à jour.`);
    this.selectedIds.set(new Set());
    this.allChecked.set(false);
  }

  protected banSelected(): void {
    if (this.selectedIds().size === 0) {
      return;
    }
    for (const user of this.selectedUsers()) {
      this.userService.updateUser(user.id, { status: 'banned' }).subscribe({
        next: (updated) => this.replaceUser(updated),
        error: (error: HttpErrorResponse) => this.handleError(error),
      });
    }
    this.notice.set(`${this.selectedIds().size} utilisateur(s) banni(s).`);
    this.selectedIds.set(new Set());
    this.allChecked.set(false);
  }

  protected exportCsv(): void {
    const rows = [
      ['Prénom', 'Nom', 'Email', 'Rôle', 'Statut'],
      ...this.users().map((user) => [user.firstName, user.lastName, user.email, user.role, user.status]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'utilisateurs.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  protected openActivity(user: User): void {
    this.activityUser.set(user);
    this.activityLoading.set(true);
    this.statisticsService.getUserStats(user.id).subscribe({
      next: (stats) => {
        this.activityStats.set(stats);
        this.activityLoading.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected closeActivity(): void {
    this.activityUser.set(null);
    this.activityStats.set(null);
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  protected roleLabel(role: UserRole): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'INSTRUCTOR':
        return 'Instructeur';
      default:
        return 'Étudiant';
    }
  }

  private replaceUser(updated: User): void {
    this.users.update((users) => users.map((user) => (user.id === updated.id ? updated : user)));
  }

  private handleError(error: HttpErrorResponse): void {
    this.loading.set(false);
    this.activityLoading.set(false);
    const body = error.error as { message?: string } | null;
    this.errorMessage.set(body?.message ?? 'Une erreur est survenue. Veuillez réessayer.');
  }
}
