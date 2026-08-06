import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent, type SelectOption } from '../../../shared/components/select/select.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ROUTES } from '../../../shared/constants';
import { FormationService, UploadService } from '../../../core/services';
import type {
  FormationDetail,
  FormationLevel,
  FormationModule,
  FormationPayload,
  FormationStatus,
  Lesson,
  LessonPayload,
  LessonStatus,
  ModulePayload,
} from '../../../core/models';

const CATEGORIES = ['Développement Web', 'Data Science', 'DevOps', 'Cybersécurité', 'Mobile', 'Cloud'];

const IMAGE_MAX_SIZE = 2 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const VIDEO_MAX_SIZE = 500 * 1024 * 1024;

const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

const LEVEL_LABELS: Record<FormationLevel, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

const STATUS_LABELS: Record<FormationStatus, string> = {
  draft: 'Brouillon',
  published: 'Publiée',
  archived: 'Archivée',
};

const LESSON_STATUS_LABELS: Record<LessonStatus, string> = {
  draft: 'Brouillon',
  published: 'Publiée',
};

/**
 * FormationFormComponent — création et édition d'une formation (spec §4.3.3, §4.3.4).
 */
@Component({
  selector: 'app-formation-form',
  imports: [ReactiveFormsModule, RouterLink, InputComponent, SelectComponent, ButtonComponent, BadgeComponent],
  templateUrl: './formation-form.component.html',
  styleUrl: './formation-form.component.css',
})
export class FormationFormComponent {
  private readonly formationService = inject(FormationService);
  private readonly uploadService = inject(UploadService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly ROUTES = ROUTES;
  protected readonly stepLabels = ['Informations', 'Dates & réglages', 'Curriculum', 'Aperçu & publication'];

  protected readonly step = signal(1);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly imageUploading = signal(false);
  protected readonly imageError = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isEdit = signal(false);
  protected readonly formation = signal<FormationDetail | null>(null);
  protected readonly modules = signal<FormationModule[]>([]);
  protected readonly moduleEditorOpen = signal(false);
  protected readonly moduleEditId = signal<number | null>(null);
  protected readonly lessonEditorOpen = signal(false);
  protected readonly lessonModuleId = signal(0);
  protected readonly lessonEditId = signal<number | null>(null);
  protected readonly curriculumBusy = signal(false);
  protected readonly curriculumError = signal('');
  protected readonly videoUploading = signal(false);
  protected readonly videoError = signal('');
  protected readonly deleteModuleId = signal<number | null>(null);
  protected readonly deleteLessonId = signal<number | null>(null);

  protected readonly categoryOptions: SelectOption[] = CATEGORIES.map((category) => ({
    value: category,
    label: category,
  }));
  protected readonly levelOptions: SelectOption[] = Object.entries(LEVEL_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
  protected readonly statusOptions: SelectOption[] = Object.entries(STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
  protected readonly lessonStatusOptions: SelectOption[] = Object.entries(LESSON_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    category: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    level: new FormControl<FormationLevel>('debutant', { nonNullable: true, validators: [Validators.required] }),
    price: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    image: new FormControl('', { nonNullable: true }),
    startDate: new FormControl('', { nonNullable: true }),
    endDate: new FormControl('', { nonNullable: true }),
    maxStudents: new FormControl('50', { nonNullable: true, validators: [Validators.min(1)] }),
    status: new FormControl<FormationStatus>('draft', { nonNullable: true }),
  });

  protected readonly moduleTitleControl = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  protected readonly moduleDescriptionControl = new FormControl('', { nonNullable: true });
  protected readonly lessonTitleControl = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  protected readonly lessonDescriptionControl = new FormControl('', { nonNullable: true });
  protected readonly lessonDurationControl = new FormControl(30, { nonNullable: true, validators: [Validators.required, Validators.min(1)] });
  protected readonly lessonStatusControl = new FormControl<LessonStatus>('draft', { nonNullable: true });
  protected readonly lessonVideoUrlControl = new FormControl('', { nonNullable: true });

  private formationId = 0;

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam === null) {
        this.loading.set(false);
        return;
      }
      const id = Number(idParam);
      if (!Number.isInteger(id) || id <= 0) {
        this.errorMessage.set('Formation introuvable.');
        this.loading.set(false);
        return;
      }
      this.isEdit.set(true);
      this.formationId = id;
      this.loadFormation(id);
    });
  }

  protected titleError(): string {
    const control = this.form.controls.title;
    return control.touched && control.hasError('required') ? 'Le titre est obligatoire' : '';
  }

  protected descriptionError(): string {
    const control = this.form.controls.description;
    return control.touched && control.hasError('required') ? 'La description est obligatoire' : '';
  }

  protected categoryError(): string {
    const control = this.form.controls.category;
    return control.touched && control.hasError('required') ? 'La catégorie est obligatoire' : '';
  }

  protected priceError(): string {
    const control = this.form.controls.price;
    if (!control.touched) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Le prix est obligatoire';
    }
    return control.hasError('min') ? 'Le prix doit être positif' : '';
  }

  protected moduleTitleError(): string {
    const control = this.moduleTitleControl;
    return control.touched && control.hasError('required') ? 'Le titre est obligatoire' : '';
  }

  protected lessonTitleError(): string {
    const control = this.lessonTitleControl;
    return control.touched && control.hasError('required') ? 'Le titre est obligatoire' : '';
  }

  protected lessonDurationError(): string {
    const control = this.lessonDurationControl;
    if (!control.touched) {
      return '';
    }
    if (control.hasError('required')) {
      return 'La durée est obligatoire';
    }
    return control.hasError('min') ? 'La durée doit être positive' : '';
  }

  protected levelLabel(level: FormationLevel): string {
    return LEVEL_LABELS[level];
  }

  protected statusLabel(status: FormationStatus): string {
    return STATUS_LABELS[status];
  }

  protected onCategoryChange(value: unknown): void {
    this.form.controls.category.setValue(String(value));
  }

  protected onLevelChange(value: unknown): void {
    this.form.controls.level.setValue(value as FormationLevel);
  }

  protected onStatusChange(value: unknown): void {
    this.form.controls.status.setValue(value as FormationStatus);
  }

  protected imagePreview(): string {
    return this.form.controls.image.value;
  }

  protected onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const validationError = this.validateImage(file);
    if (validationError) {
      this.imageError.set(validationError);
      input.value = '';
      return;
    }
    this.imageError.set('');
    this.imageUploading.set(true);
    this.uploadService.uploadImage(file).subscribe({
      next: (response) => {
        this.imageUploading.set(false);
        this.form.controls.image.setValue(response.url);
      },
      error: (error: HttpErrorResponse) => {
        this.imageUploading.set(false);
        input.value = '';
        const body = error.error as { message?: string } | null;
        this.imageError.set(body?.message ?? "Impossible de téléverser l'image. Veuillez réessayer.");
      },
    });
  }

  protected removeImage(): void {
    this.form.controls.image.setValue('');
    this.imageError.set('');
  }

  private validateImage(file: File): string {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return 'Le fichier doit être une image (JPG, PNG, WebP ou GIF).';
    }
    if (file.size > IMAGE_MAX_SIZE) {
      return "L'image ne doit pas dépasser 2 Mo.";
    }
    return '';
  }

  protected openModuleEditor(module?: FormationModule): void {
    this.curriculumError.set('');
    this.moduleEditId.set(module?.id ?? null);
    this.moduleTitleControl.setValue(module?.title ?? '');
    this.moduleDescriptionControl.setValue(module?.description ?? '');
    this.moduleTitleControl.markAsUntouched();
    this.moduleEditorOpen.set(true);
  }

  protected closeModuleEditor(): void {
    this.moduleEditorOpen.set(false);
    this.moduleEditId.set(null);
  }

  protected saveModule(): void {
    if (this.curriculumBusy()) {
      return;
    }
    if (this.moduleTitleControl.invalid) {
      this.moduleTitleControl.markAsTouched();
      return;
    }
    this.curriculumBusy.set(true);
    this.curriculumError.set('');
    const payload: ModulePayload = {
      title: this.moduleTitleControl.value.trim(),
      description: this.moduleDescriptionControl.value.trim() || undefined,
    };
    const request$ =
      this.moduleEditId() === null
        ? this.formationService.createModule(this.formationId, payload)
        : this.formationService.updateModule(this.moduleEditId()!, payload);
    request$.subscribe({
      next: () => {
        this.curriculumBusy.set(false);
        this.closeModuleEditor();
        this.reloadModules();
      },
      error: (error: HttpErrorResponse) => {
        this.curriculumBusy.set(false);
        this.curriculumError.set(this.extractErrorMessage(error));
      },
    });
  }

  protected askDeleteModule(id: number): void {
    this.deleteModuleId.set(id);
  }

  protected cancelDeleteModule(): void {
    this.deleteModuleId.set(null);
  }

  protected confirmDeleteModule(id: number): void {
    if (this.curriculumBusy()) {
      return;
    }
    this.curriculumBusy.set(true);
    this.curriculumError.set('');
    this.formationService.deleteModule(id).subscribe({
      next: () => {
        this.curriculumBusy.set(false);
        this.deleteModuleId.set(null);
        this.reloadModules();
      },
      error: (error: HttpErrorResponse) => {
        this.curriculumBusy.set(false);
        this.curriculumError.set(this.extractErrorMessage(error));
      },
    });
  }

  protected openLessonEditor(moduleId: number, lesson?: Lesson): void {
    this.curriculumError.set('');
    this.videoError.set('');
    this.lessonModuleId.set(moduleId);
    this.lessonEditId.set(lesson?.id ?? null);
    this.lessonTitleControl.setValue(lesson?.title ?? '');
    this.lessonDescriptionControl.setValue(lesson?.description ?? '');
    this.lessonDurationControl.setValue(lesson?.durationMinutes ?? 30);
    this.lessonStatusControl.setValue(lesson?.status ?? 'draft');
    this.lessonVideoUrlControl.setValue(lesson?.videoUrl ?? '');
    this.lessonTitleControl.markAsUntouched();
    this.lessonDurationControl.markAsUntouched();
    this.lessonEditorOpen.set(true);
  }

  protected closeLessonEditor(): void {
    this.lessonEditorOpen.set(false);
    this.lessonEditId.set(null);
    this.lessonModuleId.set(0);
  }

  protected saveLesson(): void {
    if (this.curriculumBusy()) {
      return;
    }
    if (this.lessonTitleControl.invalid || this.lessonDurationControl.invalid) {
      this.lessonTitleControl.markAsTouched();
      this.lessonDurationControl.markAsTouched();
      return;
    }
    this.curriculumBusy.set(true);
    this.curriculumError.set('');
    const payload: LessonPayload = {
      title: this.lessonTitleControl.value.trim(),
      description: this.lessonDescriptionControl.value.trim() || undefined,
      durationMinutes: Number(this.lessonDurationControl.value),
      videoUrl: this.lessonVideoUrlControl.value.trim() || undefined,
      status: this.lessonStatusControl.value,
    };
    const request$ =
      this.lessonEditId() === null
        ? this.formationService.createLesson(this.lessonModuleId(), payload)
        : this.formationService.updateLesson(this.lessonEditId()!, payload);
    request$.subscribe({
      next: () => {
        this.curriculumBusy.set(false);
        this.closeLessonEditor();
        this.reloadModules();
      },
      error: (error: HttpErrorResponse) => {
        this.curriculumBusy.set(false);
        this.curriculumError.set(this.extractErrorMessage(error));
      },
    });
  }

  protected askDeleteLesson(id: number): void {
    this.deleteLessonId.set(id);
  }

  protected cancelDeleteLesson(): void {
    this.deleteLessonId.set(null);
  }

  protected confirmDeleteLesson(id: number): void {
    if (this.curriculumBusy()) {
      return;
    }
    this.curriculumBusy.set(true);
    this.curriculumError.set('');
    this.formationService.deleteLesson(id).subscribe({
      next: () => {
        this.curriculumBusy.set(false);
        this.deleteLessonId.set(null);
        this.reloadModules();
      },
      error: (error: HttpErrorResponse) => {
        this.curriculumBusy.set(false);
        this.curriculumError.set(this.extractErrorMessage(error));
      },
    });
  }

  protected onLessonStatusChange(value: unknown): void {
    this.lessonStatusControl.setValue(value as LessonStatus);
  }

  protected onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const validationError = this.validateVideo(file);
    if (validationError) {
      this.videoError.set(validationError);
      input.value = '';
      return;
    }
    this.videoError.set('');
    this.videoUploading.set(true);
    this.uploadService.uploadVideo(file).subscribe({
      next: (response) => {
        this.videoUploading.set(false);
        this.lessonVideoUrlControl.setValue(response.url);
      },
      error: (error: HttpErrorResponse) => {
        this.videoUploading.set(false);
        input.value = '';
        const body = error.error as { message?: string } | null;
        this.videoError.set(body?.message ?? 'Impossible de téléverser la vidéo. Veuillez réessayer.');
      },
    });
  }

  protected removeVideo(): void {
    this.lessonVideoUrlControl.setValue('');
    this.videoError.set('');
  }

  private validateVideo(file: File): string {
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      return 'Le fichier doit être une vidéo (MP4, WebM ou OGG).';
    }
    if (file.size > VIDEO_MAX_SIZE) {
      return 'La vidéo ne doit pas dépasser 500 Mo.';
    }
    return '';
  }

  protected cancelRoute(): string {
    return this.isEdit() ? ROUTES.formationsDetail(this.formationId) : ROUTES.formations;
  }

  protected nextStep(): void {
    if (this.step() === 1 && !this.stepOneValid()) {
      this.markStepOneTouched();
      return;
    }
    this.step.set(Math.min(this.step() + 1, 4));
  }

  protected previousStep(): void {
    this.step.set(Math.max(this.step() - 1, 1));
  }

  protected save(publish: boolean): void {
    if (this.saving()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.step.set(1);
      this.errorMessage.set('Veuillez corriger les champs obligatoires en rouge.');
      return;
    }
    this.saving.set(true);
    this.errorMessage.set('');
    const request$ = this.isEdit()
      ? this.formationService.updateFormation(this.formationId, this.buildPayload(publish))
      : this.formationService.createFormation(this.buildPayload(publish));
    request$.subscribe({
      next: (formation) => {
        this.saving.set(false);
        this.router.navigate([ROUTES.formationsDetail(formation.id)]);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(this.extractErrorMessage(error));
      },
    });
  }

  private stepOneValid(): boolean {
    const { title, description, category, level, price } = this.form.controls;
    return title.valid && description.valid && category.valid && level.valid && price.valid;
  }

  private markStepOneTouched(): void {
    const { title, description, category, level, price } = this.form.controls;
    title.markAsTouched();
    description.markAsTouched();
    category.markAsTouched();
    level.markAsTouched();
    price.markAsTouched();
  }

  private buildPayload(publish: boolean): FormationPayload {
    const values = this.form.getRawValue();
    const current = this.formation();
    return {
      title: values.title,
      description: values.description,
      category: values.category,
      level: values.level,
      price: Number(values.price),
      status: publish ? 'published' : values.status,
      image: values.image || undefined,
      startDate: values.startDate,
      endDate: values.endDate,
      maxStudents: Number(values.maxStudents),
      objectives: current?.objectives ?? [],
      requirements: current?.requirements ?? [],
    };
  }

  private loadFormation(id: number): void {
    this.formationService.getFormation(id).subscribe({
      next: (formation) => {
        this.formation.set(formation);
        this.form.patchValue({
          title: formation.title,
          description: formation.description,
          category: formation.category,
          level: formation.level,
          price: formation.price.toString(),
          image: formation.image ?? '',
          startDate: formation.startDate.slice(0, 10),
          endDate: formation.endDate.slice(0, 10),
          maxStudents: formation.maxStudents.toString(),
          status: formation.status,
        });
        this.loadModules(id);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.extractErrorMessage(error));
      },
    });
  }

  private loadModules(id: number): void {
    this.formationService.getFormationModules(id).subscribe({
      next: (modules) => {
        this.modules.set(modules);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private reloadModules(): void {
    this.formationService.getFormationModules(this.formationId).subscribe({
      next: (modules) => this.modules.set(modules),
      error: () => this.curriculumError.set('Impossible de recharger le curriculum.'),
    });
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const body = error.error as { message?: string } | null;
    return body?.message ?? "Impossible d'enregistrer la formation. Veuillez réessayer.";
  }
}
