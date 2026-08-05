import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormationService, NotificationService } from '@core/services';
import type { FormationModule, ModulePayload } from '@core/models';
import { ROUTE_PATHS } from '@shared/constants';

/**
 * Module Form Component - Create/Edit module
 */
@Component({
  selector: 'app-module-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">
        {{ isEditMode ? 'Éditer Module' : 'Créer Module' }}
      </h1>

      <form [formGroup]="form" (ngSubmit)="submitForm()" class="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
        <!-- Title -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Titre *</label>
          <input
            type="text"
            formControlName="title"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            placeholder="Ex: Fondamentaux de Spring Boot"
          />
          <div *ngIf="form.get('title')?.invalid && form.get('title')?.touched" class="text-red-600 text-sm mt-1">
            Le titre est requis
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Description</label>
          <textarea
            formControlName="description"
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            placeholder="Description du module..."
          ></textarea>
        </div>

        <!-- Order -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Ordre *</label>
          <input
            type="number"
            formControlName="order"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            min="1"
          />
          <div *ngIf="form.get('order')?.invalid && form.get('order')?.touched" class="text-red-600 text-sm mt-1">
            L'ordre est requis
          </div>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Statut</label>
          <select
            formControlName="status"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          >
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
        </div>

        <!-- Submit Buttons -->
        <div class="flex gap-4">
          <button
            type="submit"
            [disabled]="form.invalid || isSubmitting"
            class="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
          <button
            type="button"
            (click)="goBack()"
            class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ModuleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly formationService = inject(FormationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    order: [1, Validators.required],
    status: ['DRAFT'],
  });

  isEditMode = false;
  isSubmitting = false;
  formationId: number = 0;
  moduleId: number = 0;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.formationId = parseInt(params['id'], 10);
      this.moduleId = parseInt(params['mId'] || '0', 10);
      this.isEditMode = this.moduleId > 0;
    });
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.notification.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    this.isSubmitting = true;
    const payload: ModulePayload = this.form.value as ModulePayload;

    const request$ = this.isEditMode
      ? this.formationService.updateModule(this.moduleId, payload)
      : this.formationService.createModule(this.formationId, payload);

    request$.subscribe({
      next: () => {
        this.notification.success(this.isEditMode ? 'Module modifié' : 'Module créé');
        this.goBack();
      },
      error: () => {
        this.notification.error('Erreur lors de l\'enregistrement');
        this.isSubmitting = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate([`${ROUTE_PATHS.formations}/${this.formationId}/modules`]);
  }
}
