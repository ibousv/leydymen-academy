import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormationService, NotificationService } from '@core/services';
import type { Lesson } from '@core/models';
import { ROUTE_PATHS } from '@shared/constants';

/**
 * Lesson List Component - Manage lessons for a module
 */
@Component({
  selector: 'app-lesson-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Leçons</h1>
          <p class="text-gray-600">Gestion des leçons du module</p>
        </div>
        <button
          (click)="addLesson()"
          class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          + Ajouter Leçon
        </button>
      </div>

      <div *ngIf="isLoading" class="text-center py-8">
        <p class="text-gray-600">Chargement des leçons...</p>
      </div>

      <div *ngIf="!isLoading && lessons.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
        <p class="text-gray-600">Aucune leçon créée. Cliquez sur "Ajouter Leçon" pour commencer.</p>
      </div>

      <div *ngIf="!isLoading && lessons.length > 0" class="space-y-4">
        <div *ngFor="let lesson of lessons" class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900">{{ lesson.title }}</h3>
              <p class="text-gray-600 mt-1">{{ lesson.description | slice: 0:100 }}...</p>
              <div class="mt-2 flex gap-2 items-center">
                <span class="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">{{ lesson.order }}. Leçon</span>
                <span class="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">{{ lesson.durationMinutes }} min</span>
                <span [class]="getStatusClass(lesson.status)">{{ lesson.status }}</span>
              </div>
              <div *ngIf="lesson.videoUrl" class="mt-2">
                <a [href]="lesson.videoUrl" target="_blank" class="text-blue-600 hover:underline text-sm">
                  📹 Voir la vidéo
                </a>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                (click)="editLesson(lesson.id)"
                class="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded text-sm transition"
              >
                Éditer
              </button>
              <button
                (click)="deleteLesson(lesson.id)"
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
          ← Retour aux modules
        </button>
      </div>
    </div>
  `,
})
export class LessonListComponent implements OnInit {
  private readonly formationService = inject(FormationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  lessons: Lesson[] = [];
  isLoading = false;
  formationId: number = 0;
  moduleId: number = 0;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.formationId = parseInt(params['id'], 10);
      this.moduleId = parseInt(params['mId'], 10);
      this.loadLessons();
    });
  }

  loadLessons(): void {
    this.isLoading = true;
    // Note: Backend n'a pas encore d'endpoint direct pour les leçons d'un module
    // On utilise un mock pour maintenant
    this.lessons = [];
    this.isLoading = false;
    this.notification.warning('Fonctionnalité en cours de développement');
  }

  addLesson(): void {
    this.router.navigate([
      `${ROUTE_PATHS.formations}/${this.formationId}/modules/${this.moduleId}/lessons/create`,
    ]);
  }

  editLesson(lessonId: number): void {
    this.router.navigate([
      `${ROUTE_PATHS.formations}/${this.formationId}/modules/${this.moduleId}/lessons/${lessonId}/edit`,
    ]);
  }

  deleteLesson(lessonId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette leçon ?')) {
      this.formationService.deleteLesson(lessonId).subscribe({
        next: () => {
          this.notification.success('Leçon supprimée');
          this.loadLessons();
        },
        error: () => {
          this.notification.error('Erreur lors de la suppression');
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate([`${ROUTE_PATHS.formations}/${this.formationId}/modules`]);
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
