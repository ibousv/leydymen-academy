import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ElementRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ProgressComponent } from '../../../shared/components/progress/progress.component';
import { ROUTES } from '../../../shared/constants';
import { EnrollmentService, FormationService, ProgressService } from '../../../core/services';
import type { Enrollment, FormationModule, Lesson, Progress } from '../../../core/models';

/** Lecteur de cours (spec §4.6.2). */
@Component({
  selector: 'app-course-player',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, ProgressComponent],
  templateUrl: './course-player.component.html',
  styleUrl: './course-player.component.css',
})
export class CoursePlayerComponent {
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly formationService = inject(FormationService);
  private readonly progressService = inject(ProgressService);
  private readonly route = inject(ActivatedRoute);

  protected readonly ROUTES = ROUTES;

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly notice = signal('');

  protected readonly enrollment = signal<Enrollment | null>(null);
  protected readonly modules = signal<FormationModule[]>([]);
  protected readonly progress = signal<Progress | null>(null);
  protected readonly activeLessonId = signal<number | null>(null);
  protected readonly expandedModules = signal<Set<number>>(new Set());

  protected readonly playing = signal(false);
  protected readonly currentTime = signal(0);
  protected readonly duration = signal(0);
  protected readonly playbackRate = signal(1);

  protected readonly videoElement = viewChild<ElementRef<HTMLVideoElement>>('videoPlayer');
  protected readonly videoContainer = viewChild<ElementRef<HTMLDivElement>>('videoContainer');

  protected readonly flattenedLessons = computed<Lesson[]>(() => {
    const lessons: Lesson[] = [];
    for (const module of this.modules()) {
      lessons.push(...module.lessons);
    }
    return lessons;
  });
  protected readonly activeLesson = computed<Lesson | null>(() => {
    const id = this.activeLessonId();
    return this.flattenedLessons().find((lesson) => lesson.id === id) ?? null;
  });
  protected readonly nextLesson = computed<Lesson | null>(() => {
    const lessons = this.flattenedLessons();
    const index = lessons.findIndex((lesson) => lesson.id === this.activeLessonId());
    return index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null;
  });
  protected readonly videoProgress = computed(() => {
    const total = this.duration();
    return total > 0 ? (this.currentTime() / total) * 100 : 0;
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('enrollmentId'));
      if (!Number.isInteger(id) || id <= 0) {
        this.errorMessage.set('Inscription introuvable.');
        this.loading.set(false);
        return;
      }
      this.loadEnrollment(id);
    });
  }

  protected isLessonCompleted(lessonId: number): boolean {
    return this.progress()?.lessons.find((entry) => entry.lessonId === lessonId)?.completed ?? false;
  }

  protected lessonProgress(lessonId: number): number {
    return this.progress()?.lessons.find((entry) => entry.lessonId === lessonId)?.percent ?? 0;
  }

  protected isModuleExpanded(moduleId: number): boolean {
    return this.expandedModules().has(moduleId);
  }

  protected selectLesson(lessonId: number): void {
    this.activeLessonId.set(lessonId);
    this.playing.set(false);
    this.currentTime.set(0);
  }

  protected toggleModule(moduleId: number): void {
    const expanded = new Set(this.expandedModules());
    if (expanded.has(moduleId)) {
      expanded.delete(moduleId);
    } else {
      expanded.add(moduleId);
    }
    this.expandedModules.set(expanded);
  }

  protected markAsComplete(): void {
    const lesson = this.activeLesson();
    if (!lesson || this.isLessonCompleted(lesson.id)) {
      return;
    }
    this.progressService.markLessonAsComplete(lesson.id).subscribe({
      next: () => {
        this.notice.set(`Leçon « ${lesson.title} » marquée comme terminée.`);
        this.reloadProgress();
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected goToNextLesson(): void {
    const next = this.nextLesson();
    if (next) {
      this.selectLesson(next.id);
    }
  }

  protected onPlay(): void {
    this.playing.set(true);
  }

  protected onPause(): void {
    this.playing.set(false);
  }

  protected onTimeUpdate(): void {
    const video = this.videoElement()?.nativeElement;
    if (video) {
      this.currentTime.set(video.currentTime);
      this.duration.set(video.duration || 0);
    }
  }

  protected togglePlay(): void {
    const video = this.videoElement()?.nativeElement;
    if (!video) {
      return;
    }
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  }

  protected onSeek(event: Event): void {
    const video = this.videoElement()?.nativeElement;
    if (!video || !video.duration) {
      return;
    }
    const value = Number((event.target as HTMLInputElement).value);
    video.currentTime = (value / 100) * video.duration;
    this.currentTime.set(video.currentTime);
  }

  protected onSpeedChange(event: Event): void {
    const video = this.videoElement()?.nativeElement;
    const rate = Number((event.target as HTMLSelectElement).value);
    this.playbackRate.set(rate);
    if (video) {
      video.playbackRate = rate;
    }
  }

  protected toggleFullscreen(): void {
    const container = this.videoContainer()?.nativeElement;
    if (!container || typeof container.requestFullscreen !== 'function') {
      return;
    }
    void container.requestFullscreen();
  }

  protected formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return '00:00';
    }
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  }

  private loadEnrollment(enrollmentId: number): void {
    this.enrollmentService.getEnrollment(enrollmentId).subscribe({
      next: (enrollment) => {
        this.enrollment.set(enrollment);
        this.loadCourse(enrollment.formationId, enrollmentId);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  private loadCourse(formationId: number, enrollmentId: number): void {
    forkJoin({
      modules: this.formationService.getFormationModules(formationId),
      progress: this.enrollmentService.getEnrollmentProgress(enrollmentId),
    }).subscribe({
      next: ({ modules, progress }) => {
        this.modules.set(modules);
        this.progress.set(progress);
        this.expandedModules.set(new Set(modules.map((module) => module.id)));
        this.selectFirstIncompleteLesson();
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  private selectFirstIncompleteLesson(): void {
    const lessons = this.flattenedLessons();
    const firstIncomplete =
      lessons.find((lesson) => !this.isLessonCompleted(lesson.id)) ?? lessons[0];
    this.activeLessonId.set(firstIncomplete?.id ?? null);
  }

  private reloadProgress(): void {
    const enrollment = this.enrollment();
    if (!enrollment) {
      return;
    }
    this.enrollmentService.getEnrollmentProgress(enrollment.id).subscribe({
      next: (progress) => this.progress.set(progress),
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  private handleError(error: HttpErrorResponse): void {
    this.loading.set(false);
    const body = error.error as { message?: string } | null;
    this.errorMessage.set(body?.message ?? 'Impossible de charger le cours. Veuillez réessayer.');
  }
}
