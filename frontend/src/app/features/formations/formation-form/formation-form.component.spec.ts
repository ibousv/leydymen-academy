import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { FormationFormComponent } from './formation-form.component';
import { FormationService, UploadService } from '../../../core/services';
import type { Formation, FormationDetail, FormationModule } from '../../../core/models';

const formationDetail: FormationDetail = {
  id: 6,
  title: 'Développement Web Full-Stack',
  description: 'Apprenez à développer des applications web complètes.',
  category: 'Développement Web',
  level: 'intermediaire',
  price: 450000,
  status: 'published',
  instructorId: 2,
  instructor: { id: 2, firstName: 'Fatou', lastName: 'Ndiaye', email: 'instructor@leydymen.com' },
  rating: 4.5,
  ratingCount: 12,
  studentsCount: 5,
  startDate: '2026-03-01T00:00:00Z',
  endDate: '2026-09-30T00:00:00Z',
  maxStudents: 50,
  objectives: ['Construire une API REST'],
  requirements: ['Bases de JavaScript'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  modules: [],
};

const createdFormation: Formation = {
  ...formationDetail,
  id: 9,
  title: 'Nouvelle formation',
};

const modules: FormationModule[] = [
  {
    id: 7,
    formationId: 6,
    title: 'Introduction',
    description: 'Premiers pas',
    order: 1,
    lessons: [
      { id: 8, moduleId: 7, title: 'Bienvenue', durationMinutes: 10, order: 1, status: 'published' },
      { id: 9, moduleId: 7, title: 'Installation', durationMinutes: 15, order: 2, status: 'published' },
    ],
  },
];

@Component({ standalone: true, template: '' })
class EmptyComponent {}

function makeRouteStub(id: string | null): { paramMap: Observable<{ get: (key: string) => string | null }> } {
  return { paramMap: of({ get: (key: string) => (key === 'id' ? id : null) }) };
}

function setInput(fixture: ComponentFixture<FormationFormComponent>, selector: string, value: string): void {
  const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

function setSelect(fixture: ComponentFixture<FormationFormComponent>, index: number): void {
  const select = fixture.nativeElement.querySelectorAll('select')[index] as HTMLSelectElement;
  select.value = String(index === 0 ? 1 : 0);
  select.dispatchEvent(new Event('change'));
  fixture.detectChanges();
}

function clickButton(fixture: ComponentFixture<FormationFormComponent>, label: string): void {
  const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
  for (const button of Array.from(buttons)) {
    if (button.textContent?.trim().includes(label)) {
      button.click();
      fixture.detectChanges();
      return;
    }
  }
}

function fillStepOne(fixture: ComponentFixture<FormationFormComponent>): void {
  setInput(fixture, 'input[type="text"]', 'Nouvelle formation');
  setInput(fixture, 'textarea', 'Description de la formation');
  setSelect(fixture, 0);
  setInput(fixture, 'input[type="number"]', '250000');
}

describe('FormationFormComponent', () => {
  let formationService: jasmine.SpyObj<FormationService>;
  let uploadService: jasmine.SpyObj<UploadService>;
  let router: Router;

  beforeEach(async () => {
    formationService = jasmine.createSpyObj('FormationService', [
      'getFormations',
      'getFormation',
      'createFormation',
      'updateFormation',
      'deleteFormation',
      'searchFormations',
      'getFormationModules',
      'createModule',
      'updateModule',
      'deleteModule',
      'createLesson',
      'updateLesson',
      'deleteLesson',
    ]);
    uploadService = jasmine.createSpyObj('UploadService', ['uploadImage', 'uploadVideo']);
    await TestBed.configureTestingModule({
      imports: [FormationFormComponent],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: ActivatedRoute, useValue: makeRouteStub(null) },
        { provide: FormationService, useValue: formationService },
        { provide: UploadService, useValue: uploadService },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
  });

  function createFixture(): ComponentFixture<FormationFormComponent> {
    const fixture = TestBed.createComponent(FormationFormComponent);
    fixture.detectChanges();
    return fixture;
  }

  function setupEditMode(): ComponentFixture<FormationFormComponent> {
    TestBed.resetTestingModule();
    formationService = jasmine.createSpyObj('FormationService', [
      'getFormations',
      'getFormation',
      'createFormation',
      'updateFormation',
      'deleteFormation',
      'searchFormations',
      'getFormationModules',
      'createModule',
      'updateModule',
      'deleteModule',
      'createLesson',
      'updateLesson',
      'deleteLesson',
    ]);
    formationService.getFormation.and.returnValue(of(formationDetail));
    formationService.getFormationModules.and.returnValue(of(modules));
    void TestBed.configureTestingModule({
      imports: [FormationFormComponent],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: ActivatedRoute, useValue: makeRouteStub('6') },
        { provide: FormationService, useValue: formationService },
        { provide: UploadService, useValue: uploadService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(FormationFormComponent);
    fixture.detectChanges();
    return fixture;
  }

  function goToStepThree(fixture: ComponentFixture<FormationFormComponent>): void {
    clickButton(fixture, 'Suivant');
    clickButton(fixture, 'Suivant');
  }

  it('should render the create form with step 1 fields', () => {
    const fixture = createFixture();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Créer une formation');
    expect(text).toContain('Titre de la formation');
    expect(text).toContain('Catégorie');
    expect(text).toContain('Niveau');
    expect(text).toContain('Prix');
    expect(text).toContain('Suivant');
    expect(text).not.toContain('Précédent');
  });

  it('should block step 1 and show required errors when fields are empty', () => {
    const fixture = createFixture();
    clickButton(fixture, 'Suivant');
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Le titre est obligatoire');
    expect(text).toContain('La description est obligatoire');
    expect(text).not.toContain('Date de début');
  });

  it('should reach the preview step and publish a new formation', async () => {
    formationService.createFormation.and.returnValue(of(createdFormation));
    const fixture = createFixture();
    fillStepOne(fixture);
    clickButton(fixture, 'Suivant');
    clickButton(fixture, 'Suivant');
    clickButton(fixture, 'Suivant');
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Aperçu de la formation');
    expect(text).toContain('Nouvelle formation');
    expect(text).toContain('250000 FCFA');

    clickButton(fixture, 'Publier');
    await fixture.whenStable();
    expect(formationService.createFormation).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Nouvelle formation',
        price: 250000,
        status: 'published',
        maxStudents: 50,
      }),
    );
    expect(router.url).toContain('/formations/9');
  });

  it('should save a new formation as draft', () => {
    formationService.createFormation.and.returnValue(of(createdFormation));
    const fixture = createFixture();
    fillStepOne(fixture);
    clickButton(fixture, 'Suivant');
    clickButton(fixture, 'Suivant');
    clickButton(fixture, 'Suivant');
    clickButton(fixture, 'Enregistrer le brouillon');
    expect(formationService.createFormation).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 'draft' }),
    );
  });

  it('should prefill the form and load modules in edit mode', () => {
    TestBed.resetTestingModule();
    formationService = jasmine.createSpyObj('FormationService', [
      'getFormations',
      'getFormation',
      'createFormation',
      'updateFormation',
      'deleteFormation',
      'searchFormations',
      'getFormationModules',
      'createModule',
      'updateModule',
      'deleteModule',
      'createLesson',
      'updateLesson',
      'deleteLesson',
    ]);
    formationService.getFormation.and.returnValue(of(formationDetail));
    formationService.getFormationModules.and.returnValue(of(modules));
    void TestBed.configureTestingModule({
      imports: [FormationFormComponent],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: ActivatedRoute, useValue: makeRouteStub('6') },
        { provide: FormationService, useValue: formationService },
        { provide: UploadService, useValue: uploadService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(FormationFormComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Modifier la formation');
    expect((fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement).value).toBe(
      'Développement Web Full-Stack',
    );
    expect((fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement).value).toBe('450000');
    expect(formationService.getFormationModules).toHaveBeenCalledWith(6);

    clickButton(fixture, 'Suivant');
    clickButton(fixture, 'Suivant');
    const stepThree = fixture.nativeElement.textContent as string;
    expect(stepThree).toContain('Introduction');
    expect(stepThree).toContain('Bienvenue');
    expect(stepThree).toContain('10 min');
  });

  it('should update the formation in edit mode', () => {
    TestBed.resetTestingModule();
    formationService = jasmine.createSpyObj('FormationService', [
      'getFormations',
      'getFormation',
      'createFormation',
      'updateFormation',
      'deleteFormation',
      'searchFormations',
      'getFormationModules',
      'createModule',
      'updateModule',
      'deleteModule',
      'createLesson',
      'updateLesson',
      'deleteLesson',
    ]);
    formationService.getFormation.and.returnValue(of(formationDetail));
    formationService.getFormationModules.and.returnValue(of(modules));
    formationService.updateFormation.and.returnValue(of(createdFormation));
    void TestBed.configureTestingModule({
      imports: [FormationFormComponent],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: ActivatedRoute, useValue: makeRouteStub('6') },
        { provide: FormationService, useValue: formationService },
        { provide: UploadService, useValue: uploadService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(FormationFormComponent);
    fixture.detectChanges();
    setInput(fixture, 'input[type="text"]', 'Titre modifié');
    clickButton(fixture, 'Suivant');
    clickButton(fixture, 'Suivant');
    clickButton(fixture, 'Suivant');
    clickButton(fixture, 'Publier');
    expect(formationService.updateFormation).toHaveBeenCalledWith(
      6,
      jasmine.objectContaining({ title: 'Titre modifié', status: 'published' }),
    );
  });

  it('should display the API error message when saving fails', () => {
    formationService.createFormation.and.returnValue(
      throwError(() => new HttpErrorResponse({ error: { message: 'Le titre est obligatoire' }, status: 400 })),
    );
    const fixture = createFixture();
    fillStepOne(fixture);
    clickButton(fixture, 'Suivant');
    clickButton(fixture, 'Suivant');
    clickButton(fixture, 'Suivant');
    clickButton(fixture, 'Publier');
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Le titre est obligatoire');
  });

  function selectFile(fixture: ComponentFixture<FormationFormComponent>, file: File): void {
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  it('should upload an image and show the preview', () => {
    uploadService.uploadImage.and.returnValue(of({ url: 'http://localhost:4000/uploads/course.png' }));
    const fixture = createFixture();
    selectFile(fixture, new File(['data'], 'course.png', { type: 'image/png' }));

    expect(uploadService.uploadImage).toHaveBeenCalledWith(jasmine.any(File));
    const img = fixture.nativeElement.querySelector('.image-upload__preview') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toContain('uploads/course.png');
  });

  it('should reject a non-image file without uploading', () => {
    const fixture = createFixture();
    selectFile(fixture, new File(['data'], 'doc.pdf', { type: 'application/pdf' }));

    expect(uploadService.uploadImage).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Le fichier doit être une image (JPG, PNG, WebP ou GIF).');
  });

  it('should create a module in the curriculum editor', () => {
    const fixture = setupEditMode();
    formationService.createModule.and.returnValue(of({ id: 20, formationId: 6, title: 'Module avancé', order: 2, lessons: [] }));
    goToStepThree(fixture);
    clickButton(fixture, 'Ajouter un module');
    expect(fixture.nativeElement.textContent).toContain('Nouveau module');

    setInput(fixture, 'input[type="text"]', 'Module avancé');
    clickButton(fixture, 'Enregistrer le module');
    expect(formationService.createModule).toHaveBeenCalledWith(
      6,
      jasmine.objectContaining({ title: 'Module avancé' }),
    );
    expect(fixture.nativeElement.textContent).not.toContain('Nouveau module');
  });

  it('should block module creation when the title is empty', () => {
    const fixture = setupEditMode();
    goToStepThree(fixture);
    clickButton(fixture, 'Ajouter un module');
    clickButton(fixture, 'Enregistrer le module');

    expect(formationService.createModule).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Le titre est obligatoire');
  });

  it('should create a lesson in the curriculum editor', () => {
    const fixture = setupEditMode();
    formationService.createLesson.and.returnValue(
      of({ id: 30, moduleId: 7, title: 'HTTP et le web', durationMinutes: 20, order: 3, status: 'draft' }),
    );
    goToStepThree(fixture);
    clickButton(fixture, 'Ajouter une leçon');
    expect(fixture.nativeElement.textContent).toContain('Nouvelle leçon');

    setInput(fixture, 'input[type="text"]', 'HTTP et le web');
    setInput(fixture, 'input[type="number"]', '20');
    clickButton(fixture, 'Enregistrer la leçon');
    expect(formationService.createLesson).toHaveBeenCalledWith(
      7,
      jasmine.objectContaining({ title: 'HTTP et le web', durationMinutes: 20, status: 'draft' }),
    );
  });

  it('should update an existing lesson', () => {
    const fixture = setupEditMode();
    formationService.updateLesson.and.returnValue(
      of({ id: 8, moduleId: 7, title: 'Bienvenue mis à jour', durationMinutes: 10, order: 1, status: 'published' }),
    );
    goToStepThree(fixture);
    const lessonEditButton = fixture.nativeElement.querySelector(
      '.curriculum__lesson .btn-link',
    ) as HTMLButtonElement;
    lessonEditButton.click();
    fixture.detectChanges();

    setInput(fixture, 'input[type="text"]', 'Bienvenue mis à jour');
    clickButton(fixture, 'Enregistrer la leçon');
    expect(formationService.updateLesson).toHaveBeenCalledWith(
      8,
      jasmine.objectContaining({ title: 'Bienvenue mis à jour' }),
    );
  });

  it('should delete a module after confirmation', () => {
    const fixture = setupEditMode();
    formationService.deleteModule.and.returnValue(of(void 0));
    goToStepThree(fixture);
    clickButton(fixture, 'Supprimer');
    expect(fixture.nativeElement.textContent).toContain('Supprimer ce module et ses leçons ?');

    const confirmButton = fixture.nativeElement.querySelector(
      '.confirm-bar app-button button',
    ) as HTMLButtonElement;
    confirmButton.click();
    fixture.detectChanges();
    expect(formationService.deleteModule).toHaveBeenCalledWith(7);
  });

  it('should delete a lesson after confirmation', () => {
    const fixture = setupEditMode();
    formationService.deleteLesson.and.returnValue(of(void 0));
    goToStepThree(fixture);
    const lessonDeleteButton = fixture.nativeElement.querySelector(
      '.curriculum__lesson .btn-link--danger',
    ) as HTMLButtonElement;
    lessonDeleteButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Supprimer cette leçon ?');

    const confirmButton = fixture.nativeElement.querySelector(
      '.confirm-bar app-button button',
    ) as HTMLButtonElement;
    confirmButton.click();
    fixture.detectChanges();
    expect(formationService.deleteLesson).toHaveBeenCalledWith(8);
  });

  it('should upload a video for a lesson', () => {
    uploadService.uploadVideo.and.returnValue(of({ url: 'http://localhost:4000/uploads/intro.mp4' }));
    const fixture = setupEditMode();
    goToStepThree(fixture);
    clickButton(fixture, 'Ajouter une leçon');
    selectFile(fixture, new File(['data'], 'intro.mp4', { type: 'video/mp4' }));

    expect(uploadService.uploadVideo).toHaveBeenCalledWith(jasmine.any(File));
    const video = fixture.nativeElement.querySelector('.editor__video') as HTMLVideoElement;
    expect(video).not.toBeNull();
    expect(video.src).toContain('uploads/intro.mp4');
  });

  it('should reject a non-video file for a lesson', () => {
    const fixture = setupEditMode();
    goToStepThree(fixture);
    clickButton(fixture, 'Ajouter une leçon');
    selectFile(fixture, new File(['data'], 'doc.pdf', { type: 'application/pdf' }));

    expect(uploadService.uploadVideo).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Le fichier doit être une vidéo (MP4, WebM ou OGG).');
  });
});
