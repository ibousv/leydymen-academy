import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { EnrollmentDetailComponent } from './enrollment-detail.component';
import { AuthService, EnrollmentService, FormationService } from '../../../core/services';
import type { Enrollment, FormationModule, Progress, User } from '../../../core/models';

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

function makeEnrollment(): Enrollment {
  return {
    id: 10,
    formationId: 1,
    studentId: 3,
    status: 'in_progress',
    enrollmentDate: '2026-01-15T00:00:00Z',
    completionPercent: 60,
    grade: 14,
    formation: {
      id: 1,
      title: 'Développement Web',
      description: 'Description',
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
    },
    student: studentUser,
  };
}

function makeProgress(): Progress {
  return {
    formationId: 1,
    enrollmentId: 10,
    completionPercent: 60,
    completedLessonsCount: 3,
    totalLessonsCount: 5,
    lessons: [
      { lessonId: 1, percent: 100, completed: true, updatedAt: '2026-02-01T00:00:00Z' },
      { lessonId: 2, percent: 40, completed: false, updatedAt: '2026-02-01T00:00:00Z' },
      { lessonId: 3, percent: 0, completed: false, updatedAt: '2026-02-01T00:00:00Z' },
    ],
  };
}

function makeModules(): FormationModule[] {
  return [
    {
      id: 1,
      formationId: 1,
      title: 'Module 1',
      order: 1,
      lessons: [
        { id: 1, moduleId: 1, title: 'Introduction', durationMinutes: 15, order: 1, status: 'published' },
        { id: 2, moduleId: 1, title: 'Les bases', durationMinutes: 20, order: 2, status: 'published' },
        { id: 3, moduleId: 1, title: 'Les composants', durationMinutes: 25, order: 3, status: 'published' },
      ],
    },
  ];
}

function makeRouteStub(): { paramMap: Observable<{ get: (key: string) => string | null }> } {
  return { paramMap: of({ get: (key: string) => (key === 'id' ? '10' : null) }) };
}

describe('EnrollmentDetailComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let formationService: jasmine.SpyObj<FormationService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
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
    await TestBed.configureTestingModule({
      imports: [EnrollmentDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: makeRouteStub() },
        { provide: AuthService, useValue: authService },
        { provide: EnrollmentService, useValue: enrollmentService },
        { provide: FormationService, useValue: formationService },
      ],
    }).compileComponents();
  });

  it('should render the enrollment with formation details and lesson progression', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    enrollmentService.getEnrollment.and.returnValue(of(makeEnrollment()));
    enrollmentService.getEnrollmentProgress.and.returnValue(of(makeProgress()));
    formationService.getFormationModules.and.returnValue(of(makeModules()));
    const fixture = TestBed.createComponent(EnrollmentDetailComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Développement Web');
    expect(text).toContain('En cours');
    expect(text).toContain('60%');
    expect(text).toContain('3 / 5');
    expect(text).toContain('14/20');
    expect(text).toContain('Introduction');
    expect(text).toContain('Terminée');
    expect(text).toContain('Non commencée');
  });

  it('should call the enrollment APIs with the id from the route', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    enrollmentService.getEnrollment.and.returnValue(of(makeEnrollment()));
    enrollmentService.getEnrollmentProgress.and.returnValue(of(makeProgress()));
    formationService.getFormationModules.and.returnValue(of(makeModules()));
    const fixture = TestBed.createComponent(EnrollmentDetailComponent);
    fixture.detectChanges();
    expect(enrollmentService.getEnrollment).toHaveBeenCalledWith(10);
    expect(enrollmentService.getEnrollmentProgress).toHaveBeenCalledWith(10);
  });

  it('should show the continue action for a student', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    enrollmentService.getEnrollment.and.returnValue(of(makeEnrollment()));
    enrollmentService.getEnrollmentProgress.and.returnValue(of(makeProgress()));
    formationService.getFormationModules.and.returnValue(of(makeModules()));
    const fixture = TestBed.createComponent(EnrollmentDetailComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Continuer le cours');
    expect(text).not.toContain("Voir l'étudiant");
  });

  it('should show the student link for a staff member', () => {
    authService.getCurrentUser.and.returnValue(
      of({ ...studentUser, id: 1, firstName: 'Admin', role: 'ADMIN' as const }),
    );
    enrollmentService.getEnrollment.and.returnValue(of(makeEnrollment()));
    enrollmentService.getEnrollmentProgress.and.returnValue(of(makeProgress()));
    formationService.getFormationModules.and.returnValue(of(makeModules()));
    const fixture = TestBed.createComponent(EnrollmentDetailComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain("Voir l'étudiant");
    expect(text).toContain('Amadou Diallo');
    expect(text).not.toContain('Continuer le cours');
  });

  it('should show the API error message when the enrollment cannot be loaded', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    enrollmentService.getEnrollment.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 404, error: { message: 'Inscription introuvable' } })),
    );
    enrollmentService.getEnrollmentProgress.and.returnValue(of(makeProgress()));
    formationService.getFormationModules.and.returnValue(of(makeModules()));
    const fixture = TestBed.createComponent(EnrollmentDetailComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Inscription introuvable');
  });
});
