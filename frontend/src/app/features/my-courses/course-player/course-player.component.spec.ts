import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { CoursePlayerComponent } from './course-player.component';
import { EnrollmentService, FormationService, ProgressService } from '../../../core/services';
import type { Enrollment, Formation, FormationModule, Lesson, Progress, User } from '../../../core/models';

const studentUser: User = {
  id: 3,
  firstName: 'Amadou',
  lastName: 'Diallo',
  email: 'student1@leydymen.com',
  username: 'student1',
  role: 'STUDENT',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  lastActive: '2026-02-01T00:00:00Z',
};

const formation: Formation = {
  id: 6,
  title: 'Développement Web',
  description: 'Devenez développeur web',
  category: 'Développement Web',
  level: 'intermediaire',
  price: 450000,
  status: 'published',
  instructorId: 2,
  instructor: { id: 2, firstName: 'Fatou', lastName: 'Ndiaye', email: 'instructor@leydymen.com' },
  rating: 4.5,
  ratingCount: 10,
  studentsCount: 5,
  startDate: '2026-01-01T00:00:00Z',
  endDate: '2026-12-31T00:00:00Z',
  maxStudents: 50,
  objectives: [],
  requirements: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const enrollment: Enrollment = {
  id: 64,
  formationId: 6,
  studentId: 3,
  status: 'in_progress',
  enrollmentDate: '2026-01-15T00:00:00Z',
  completionPercent: 33,
  grade: null,
  formation,
  student: studentUser,
};

const lessons: Lesson[] = [
  { id: 101, moduleId: 1, title: 'Introduction', description: 'Bienvenue', durationMinutes: 8, order: 1, status: 'published', videoUrl: undefined },
  { id: 102, moduleId: 1, title: 'Variables', description: 'Les bases', durationMinutes: 12, order: 2, status: 'published', videoUrl: undefined },
  { id: 103, moduleId: 2, title: 'Fonctions', description: 'Aller plus loin', durationMinutes: 15, order: 1, status: 'published', videoUrl: undefined },
];

const modules: FormationModule[] = [
  { id: 1, formationId: 6, title: 'Module 1', description: 'Premiers pas', order: 1, lessons: [lessons[0], lessons[1]] },
  { id: 2, formationId: 6, title: 'Module 2', description: 'Avancé', order: 2, lessons: [lessons[2]] },
];

const progress: Progress = {
  formationId: 6,
  enrollmentId: 64,
  completionPercent: 33,
  completedLessonsCount: 1,
  totalLessonsCount: 3,
  lessons: [
    { lessonId: 101, percent: 100, completed: true, updatedAt: '2026-02-01T00:00:00Z' },
    { lessonId: 102, percent: 0, completed: false, updatedAt: '2026-02-01T00:00:00Z' },
    { lessonId: 103, percent: 0, completed: false, updatedAt: '2026-02-01T00:00:00Z' },
  ],
};

describe('CoursePlayerComponent', () => {
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let formationService: jasmine.SpyObj<FormationService>;
  let progressService: jasmine.SpyObj<ProgressService>;
  let paramMap: BehaviorSubject<ParamMap>;

  beforeEach(async () => {
    enrollmentService = jasmine.createSpyObj('EnrollmentService', [
      'getEnrollments',
      'getEnrollment',
      'enrollFormation',
      'cancelEnrollment',
      'updateEnrollmentStatus',
      'getEnrollmentProgress',
    ]);
    formationService = jasmine.createSpyObj('FormationService', [
      'getFormations',
      'getFormation',
      'createFormation',
      'updateFormation',
      'deleteFormation',
      'searchFormations',
      'getFormationModules',
    ]);
    progressService = jasmine.createSpyObj('ProgressService', [
      'trackLessonProgress',
      'markLessonAsComplete',
      'getFormationProgress',
      'getLessonProgress',
    ]);
    paramMap = new BehaviorSubject<ParamMap>({
      get: (key: string) => (key === 'enrollmentId' ? '64' : null),
      has: (key: string) => key === 'enrollmentId',
      getAll: () => [],
      keys: [],
    });
    await TestBed.configureTestingModule({
      imports: [CoursePlayerComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: paramMap.asObservable() } },
        { provide: EnrollmentService, useValue: enrollmentService },
        { provide: FormationService, useValue: formationService },
        { provide: ProgressService, useValue: progressService },
      ],
    }).compileComponents();
  });

  it('should render the lesson, the sidebar and the progress overview', () => {
    enrollmentService.getEnrollment.and.returnValue(of(enrollment));
    formationService.getFormationModules.and.returnValue(of(modules));
    enrollmentService.getEnrollmentProgress.and.returnValue(of(progress));
    const fixture = TestBed.createComponent(CoursePlayerComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Variables');
    expect(text).toContain('Module 1');
    expect(text).toContain('Module 2');
    expect(text).toContain('1 / 3 leçons');
    expect(text).toContain('Aucune vidéo');
  });

  it('should select the first incomplete lesson by default', () => {
    enrollmentService.getEnrollment.and.returnValue(of(enrollment));
    formationService.getFormationModules.and.returnValue(of(modules));
    enrollmentService.getEnrollmentProgress.and.returnValue(of(progress));
    const fixture = TestBed.createComponent(CoursePlayerComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Variables');
    const active = fixture.nativeElement.querySelector(
      '.course-player__lesson-item--active',
    ) as HTMLElement;
    expect(active.textContent).toContain('Variables');
  });

  it('should mark the active lesson as complete and reload the progress', () => {
    enrollmentService.getEnrollment.and.returnValue(of(enrollment));
    formationService.getFormationModules.and.returnValue(of(modules));
    enrollmentService.getEnrollmentProgress.and.returnValue(of(progress));
    progressService.markLessonAsComplete.and.returnValue(of(undefined));
    const fixture = TestBed.createComponent(CoursePlayerComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const markButton = Array.from(buttons).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Marquer comme terminée',
    ) as HTMLButtonElement;
    markButton.click();
    fixture.detectChanges();
    expect(progressService.markLessonAsComplete).toHaveBeenCalledWith(102);
    expect(enrollmentService.getEnrollmentProgress).toHaveBeenCalledWith(64);
  });

  it('should navigate to the next lesson', () => {
    enrollmentService.getEnrollment.and.returnValue(of(enrollment));
    formationService.getFormationModules.and.returnValue(of(modules));
    enrollmentService.getEnrollmentProgress.and.returnValue(of(progress));
    const fixture = TestBed.createComponent(CoursePlayerComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const nextButton = Array.from(buttons).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Leçon suivante',
    ) as HTMLButtonElement;
    nextButton.click();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Fonctions');
    const active = fixture.nativeElement.querySelector(
      '.course-player__lesson-item--active',
    ) as HTMLElement;
    expect(active.textContent).toContain('Fonctions');
  });

  it('should toggle module sections in the sidebar', () => {
    enrollmentService.getEnrollment.and.returnValue(of(enrollment));
    formationService.getFormationModules.and.returnValue(of(modules));
    enrollmentService.getEnrollmentProgress.and.returnValue(of(progress));
    const fixture = TestBed.createComponent(CoursePlayerComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.course-player__lesson-item').length).toBe(3);
    const moduleToggle = fixture.nativeElement.querySelector(
      '.course-player__module-toggle',
    ) as HTMLButtonElement;
    moduleToggle.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.course-player__lesson-item').length).toBe(1);
  });

  it('should surface the API error message', () => {
    enrollmentService.getEnrollment.and.returnValue(
      throwError(() => new HttpErrorResponse({ error: { message: 'Inscription introuvable.' }, status: 404 })),
    );
    const fixture = TestBed.createComponent(CoursePlayerComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Inscription introuvable.');
  });
});
