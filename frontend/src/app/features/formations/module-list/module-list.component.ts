import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormationService, NotificationService } from '@core/services';
import type { FormationModule } from '@core/models';
import { ROUTE_PATHS } from '@shared/constants';

/**
 * Module List Component - Manage modules for a formation
 */
@Component({
  selector: 'app-module-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Modules</h1>
          <p class="text-gray-600">Gestion des modules pour {{ formationTitle }}</p>
        </div>
        <button
          (click)="addModule()"
          class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          + Ajouter Module
        </button>
      </div>

      <div *ngIf="isLoading" class="text-center py-8">
        <p class="text-gray-600">Chargement des modules...</p>
      </div>

      <div *ngIf="!isLoading && modules.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
        <p class="text-gray-600">Aucun module créé. Cliquez sur "Ajouter Module" pour commencer.</p>
      </div>

      <div *ngIf="!isLoading && modules.length > 0" class="space-y-4">
        <div *ngFor="let module of modules" class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-semibold text-gray-900">{{ module.title }}</h3>
              <p class="text-gray-600 mt-1">{{ module.description }}</p>
              <div class="mt-2 flex gap-2">
                <span class="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">{{ module.order }}. Module</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                (click)="viewLessons(module.id)"
                class="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm transition"
              >
                Leçons
              </button>
              <button
                (click)="editModule(module.id)"
                class="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded text-sm transition"
              >
                Éditer
              </button>
              <button
                (click)="deleteModule(module.id)"
                class="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <button
          (click)="goBack()"
          class="text-primary-600 hover:text-primary-700 font-semibold"
        >
          ← Retour à la formation
        </button>
      </div>
    </div>
  `,
})
export class ModuleListComponent implements OnInit {
  private readonly formationService = inject(FormationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  modules: FormationModule[] = [];
  isLoading = false;
  formationId: number = 0;
  formationTitle = '';

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.formationId = parseInt(params['id'], 10);
      this.loadModules();
    });
  }

  loadModules(): void {
    this.isLoading = true;
    this.formationService.getFormationModules(this.formationId).subscribe({
      next: (modules: FormationModule[]) => {
        this.modules = modules.sort((a: FormationModule, b: FormationModule) => (a.order ?? 0) - (b.order ?? 0));
        this.isLoading = false;
      },
      error: () => {
        this.notification.error('Erreur lors du chargement des modules');
        this.isLoading = false;
      },
    });
  }

  addModule(): void {
    this.router.navigate([`${ROUTE_PATHS.formations}/${this.formationId}/modules/create`]);
  }

  editModule(moduleId: number): void {
    this.router.navigate([`${ROUTE_PATHS.formations}/${this.formationId}/modules/edit`], {
      queryParams: { mId: moduleId }
    });
  }

  deleteModule(moduleId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      this.formationService.deleteModule(moduleId).subscribe({
        next: () => {
          this.notification.success('Module supprimé');
          this.loadModules();
        },
        error: () => {
          this.notification.error('Erreur lors de la suppression');
        },
      });
    }
  }

  viewLessons(moduleId: number): void {
    this.router.navigate([`${ROUTE_PATHS.formations}/${this.formationId}/modules/${moduleId}/lessons`]);
  }

  goBack(): void {
    this.router.navigate([`${ROUTE_PATHS.formations}/${this.formationId}`]);
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      DRAFT: 'text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded',
      PUBLISHED: 'text-sm bg-green-100 text-green-700 px-2 py-1 rounded',
      ARCHIVED: 'text-sm bg-red-100 text-red-700 px-2 py-1 rounded',
    };
    return classes[status] || 'text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded';
  }
}
