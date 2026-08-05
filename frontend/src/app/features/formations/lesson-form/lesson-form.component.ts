import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormationService, NotificationService } from '@core/services';
import type { LessonPayload } from '@core/models';
import { ROUTE_PATHS } from '@shared/constants';

/**
 * Lesson Form Component - Create/Edit lesson
 */
@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-3xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">
        {{ isEditMode ? 'Éditer Leçon' : 'Créer Leçon' }}
      </h1>

      <form [formGroup]="form" (ngSubmit)="submitForm()" class="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
        <!-- Title -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Titre *</label>
          <input
            type="text"
            formControlName="title"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            placeholder="Ex: Introduction à Spring Boot"
          />
          <div *ngIf="form.get('title')?.invalid && form.get('title')?.touched" class="text-red-600 text-sm mt-1">
            Le titre est requis
          </div>
        </div>

        <!-- Content -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">Contenu *</label>
          <textarea
            formControlName="content"
            rows="6"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent font-mono text-sm"
            placeholder="Contenu de la leçon (Markdown supporté)..."
          ></textarea>
          <div *ngIf="form.get('content')?.invalid && form.get('content')?.touched" class="text-red-600 text-sm mt-1">
            Le contenu est requis
          </div>
        </div>

        <!-- Video URL -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">URL Vidéo</label>
          <input
            type="url"
            formControlName="videoUrl"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        <!-- Duration -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Durée (minutes) *</label>
            <input
              type="number"
              formControlName="duration"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              min="1"
            />
            <div *ngIf="form.get('duration')?.invalid && form.get('duration')?.touched" class="text-red-600 text-sm mt-1">
              La durée est requise
            </div>
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
export class LessonFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly formationService = inject(FormationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  form = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    videoUrl: [''],
    duration: [30, Validators.required],
    order: [1, Validators.required],
    status: ['DRAFT'],
  });

  isEditMode = false;
  isSubmitting = false;
  formationId: number = 0;
  moduleId: number = 0;
  lessonId: number = 0;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.formationId = parseInt(params['id'], 10);
      this.moduleId = parseInt(params['mId'], 10);
      this.lessonId = parseInt(params['lId'] || '0', 10);
      this.isEditMode = this.lessonId > 0;
    });
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.notification.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    this.isSubmitting = true;
    const payload: LessonPayload = this.form.value as LessonPayload;

    const request$ = this.isEditMode
      ? this.formationService.updateLesson(this.lessonId, payload)
      : this.formationService.createLesson(this.moduleId, payload);

    request$.subscribe({
      next: () => {
        this.notification.success(this.isEditMode ? 'Leçon modifiée' : 'Leçon créée');
        this.goBack();
      },
      error: () => {
        this.notification.error('Erreur lors de l\'enregistrement');
        this.isSubmitting = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate([
      `${ROUTE_PATHS.formations}/${this.formationId}/modules/${this.moduleId}/lessons`,
    ]);
  }
}
