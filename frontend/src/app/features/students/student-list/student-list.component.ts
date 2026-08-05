import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { ROUTES } from '../../../shared/constants';
import { EnrollmentService, UserService } from '../../../core/services';
import type { Enrollment, User, UserStatus } from '../../../core/models';

type StudentSort = 'name' | 'registrationDate' | 'lastActive';

const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  banned: 'Banni',
};

const STATUS_VARIANTS: Record<UserStatus, BadgeVariant> = {
  active: 'success',
  inactive: 'neutral',
  banned: 'error',
};

/** Liste et gestion des étudiants (spec §4.4.1). */
@Component({
  selector: 'app-student-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BadgeComponent, ButtonComponent, InputComponent, SelectComponent],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css',
})
export class StudentListComponent {
  private readonly userService = inject(UserService);
  private readonly enrollmentService = inject(EnrollmentService);

  protected readonly ROUTES = ROUTES;
  protected readonly Math = Math;

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly notice = signal('');

  protected readonly students = signal<User[]>([]);
  protected readonly enrollmentCounts = signal<Record<number, number>>({});
  protected readonly selectedIds = signal<Set<number>>(new Set());

  protected readonly search = signal('');
  protected readonly status = signal<UserStatus | ''>('');
  protected readonly sort = signal<StudentSort>('name');
  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);

  protected readonly statusOptions: SelectOption[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'banned', label: 'Banni' },
  ];
  protected readonly sortOptions: SelectOption[] = [
    { value: 'name', label: 'Nom' },
    { value: 'registrationDate', label: "Date d'inscription" },
    { value: 'lastActive', label: 'Dernière activité' },
  ];

  protected readonly total = computed(() => this.students().length);
  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  protected readonly pageNumbers = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));
  protected readonly sortedStudents = computed(() => {
    const sorted = [...this.students()];
    switch (this.sort()) {
      case 'registrationDate':
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case 'lastActive':
        sorted.sort((a, b) => b.lastActive.localeCompare(a.lastActive));
        break;
      default:
        sorted.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
    }
    return sorted;
  });
  protected readonly pagedStudents = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.sortedStudents().slice(start, start + this.pageSize());
  });
  protected readonly selectedStudents = computed(() =>
    this.students().filter((student) => this.selectedIds().has(student.id)),
  );
  protected readonly allSelected = computed(() => {
    const ids = this.selectedIds();
    const current = this.pagedStudents();
    return current.length > 0 && current.every((student) => ids.has(student.id));
  });

  constructor() {
    this.reload();
  }

  protected statusLabel(status: UserStatus): string {
    return STATUS_LABELS[status];
  }

  protected statusVariant(status: UserStatus): BadgeVariant {
    return STATUS_VARIANTS[status];
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  protected avatarInitials(student: User): string {
    return `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
  }

  protected enrollmentCount(studentId: number): number {
    return this.enrollmentCounts()[studentId] ?? 0;
  }

  protected toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const ids = new Set(this.selectedIds());
    for (const student of this.pagedStudents()) {
      if (checked) {
        ids.add(student.id);
      } else {
        ids.delete(student.id);
      }
    }
    this.selectedIds.set(ids);
  }

  protected toggleStudent(studentId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const ids = new Set(this.selectedIds());
    if (checked) {
      ids.add(studentId);
    } else {
      ids.delete(studentId);
    }
    this.selectedIds.set(ids);
  }

  protected onSearch(): void {
    this.reload();
  }

  protected onStatusChange(value: unknown): void {
    this.status.set(value as UserStatus | '');
    this.reload();
  }

  protected onSortChange(value: unknown): void {
    this.sort.set(value as StudentSort);
    this.page.set(1);
  }

  protected goToPage(pageNumber: number): void {
    this.page.set(pageNumber);
  }

  protected deactivate(student: User): void {
    if (student.status === 'inactive') {
      return;
    }
    this.userService.updateUser(student.id, { status: 'inactive' }).subscribe({
      next: () => {
        this.notice.set(`Le compte de ${student.firstName} ${student.lastName} a été désactivé.`);
        this.reload();
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected exportCsv(): void {
    const rows = [
      ['Nom', 'Email', "Date d'inscription", 'Dernière activité', 'Statut', 'Formations'],
      ...this.sortedStudents().map((student) => [
        `${student.firstName} ${student.lastName}`,
        student.email,
        this.formatDate(student.createdAt),
        this.formatDate(student.lastActive),
        STATUS_LABELS[student.status],
        String(this.enrollmentCount(student.id)),
      ]),
    ];
    this.downloadCsv(rows, 'etudiants.csv');
  }

  protected sendEmailToSelected(): void {
    const selected = this.selectedStudents();
    if (selected.length === 0) {
      return;
    }
    const bcc = selected.map((student) => student.email).join(',');
    window.location.href = `mailto:?bcc=${encodeURIComponent(bcc)}`;
  }

  protected reload(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.userService
      .getUsers({
        search: this.search() || undefined,
        role: 'STUDENT',
        status: this.status() || undefined,
        page: 1,
        pageSize: 100,
      })
      .subscribe({
        next: (students) => {
          this.students.set(students);
          this.page.set(1);
          this.loadEnrollmentCounts();
        },
        error: (error: HttpErrorResponse) => this.handleError(error),
      });
  }

  private loadEnrollmentCounts(): void {
    this.enrollmentService.getEnrollments().subscribe({
      next: (enrollments: Enrollment[]) => {
        const counts: Record<number, number> = {};
        for (const enrollment of enrollments) {
          counts[enrollment.studentId] = (counts[enrollment.studentId] ?? 0) + 1;
        }
        this.enrollmentCounts.set(counts);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private handleError(error: HttpErrorResponse): void {
    this.loading.set(false);
    const body = error.error as { message?: string } | null;
    this.errorMessage.set(body?.message ?? 'Impossible de charger les étudiants. Veuillez réessayer.');
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
