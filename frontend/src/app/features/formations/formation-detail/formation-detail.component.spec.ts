import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { FormationDetailComponent } from './formation-detail.component';
import { AuthService, EnrollmentService, FormationService } from '../../../core/services';
import type { Enrollment, Formation, FormationDetail, User } from '../../../core/models';

const studentUser: User = {
  id: 3,
  firstName: 'Amadou',
  lastName: 'Diallo',
  email: 'student1@leydymen.com',
  username: 'student1',
  role: 'STUDENT',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  lastActive: '2026-01-01T00:00:00Z',
};

const adminUser: User = {
  ...studentUser,
  id: 1,
  firstName: 'Admin',
  lastName: 'Academy',
  email: 'admin@leydymen.com',
  username: 'admin',
  role: 'ADMIN',
};

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
  objectives: ['Construire une API REST', 'Maîtriser Angular'],
  requirements: ['Bases de JavaScript'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  modules: [
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
  ],
};

const otherFormation: Formation = {
  ...formationDetail,
  id: 7,
  title: 'React Moderne',
  description: 'React',
};

const existingEnrollment: Enrollment = {
  id: 3,
  formationId: 6,
  studentId: 3,
  status: 'in_progress',
  enrollmentDate: '2026-07-01T00:00:00Z',
  completionPercent: 45,
  grade: null,
  formation: formationDetail,
  student: studentUser,
};

function makeRouteStub(): { paramMap: Observable<{ get: (key: string) => string | null }> } {
  return { paramMap: of({ get: (key: string) => (key === 'id' ? '6' : null) }) };
}

describe('FormationDetailComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let formationService: jasmine.SpyObj<FormationService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    enrollmentService = jasmine.createSpyObj('EnrollmentService', [
      'getEnrollments',
      'enrollFormation',
      'getEnrollment',
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
      imports: [FormationDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: makeRouteStub() },
        { provide: AuthService, useValue: authService },
        { provide: EnrollmentService, useValue: enrollmentService },
        { provide: FormationService, useValue: formationService },
      ],
    }).compileComponents();
  });

  it('should render the formation header with title, instructor and rating', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    formationService.getFormation.and.returnValue(of(formationDetail));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    formationService.getFormations.and.returnValue(of([otherFormation]));
    const fixture = TestBed.createComponent(FormationDetailComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Développement Web Full-Stack');
    expect(text).toContain('Fatou Ndiaye');
    expect(text).toContain('4.5');
    expect(text).toContain('5 étudiant(s)');
  });

  it('should show an enroll button for a non-enrolled student', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    formationService.getFormation.and.returnValue(of(formationDetail));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    formationService.getFormations.and.returnValue(of([]));
    const fixture = TestBed.createComponent(FormationDetailComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.detail__actions button')?.textContent).toContain('inscrire');
  });

  it('should enroll a student and show a success notice', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    formationService.getFormation.and.returnValue(of(formationDetail));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    formationService.getFormations.and.returnValue(of([]));
    enrollmentService.enrollFormation.and.returnValue(of(existingEnrollment));
    const fixture = TestBed.createComponent(FormationDetailComponent);
    fixture.detectChanges();
    const enrollButton = fixture.nativeElement.querySelector('.detail__actions button') as HTMLButtonElement;
    enrollButton.click();
    fixture.detectChanges();
    expect(enrollmentService.enrollFormation).toHaveBeenCalledWith(6);
    expect(fixture.nativeElement.querySelector('.detail__notice')?.textContent).toContain('Inscription réussie');
  });

  it('should show a continue button and progress for an enrolled student', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    formationService.getFormation.and.returnValue(of(formationDetail));
    enrollmentService.getEnrollments.and.returnValue(of([existingEnrollment]));
    formationService.getFormations.and.returnValue(of([]));
    const fixture = TestBed.createComponent(FormationDetailComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Continuer le cours');
    expect(fixture.nativeElement.querySelector('.detail__enroll-progress')).not.toBeNull();
    expect(text).not.toContain('inscrire');
  });

  it('should show an edit button for staff without enroll actions', () => {
    authService.getCurrentUser.and.returnValue(of(adminUser));
    formationService.getFormation.and.returnValue(of(formationDetail));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    formationService.getFormations.and.returnValue(of([]));
    const fixture = TestBed.createComponent(FormationDetailComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Modifier');
    expect(text).not.toContain('Continuer le cours');
    expect(text).not.toContain('inscrire');
  });

  it('should display the overview tab with objectives, requirements and price', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    formationService.getFormation.and.returnValue(of(formationDetail));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    formationService.getFormations.and.returnValue(of([]));
    const fixture = TestBed.createComponent(FormationDetailComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Construire une API REST');
    expect(text).toContain('Bases de JavaScript');
    expect(text).toContain('FCFA');
  });

  it('should display the curriculum tab with modules and lessons', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    formationService.getFormation.and.returnValue(of(formationDetail));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    formationService.getFormations.and.returnValue(of([]));
    const fixture = TestBed.createComponent(FormationDetailComponent);
    fixture.detectChanges();
    const tabButtons = fixture.nativeElement.querySelectorAll('.detail__tab');
    (tabButtons[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Module 1 : Introduction');
    expect(text).toContain('Bienvenue');
    expect(text).toContain('15 min');
  });

  it('should display the reviews tab with the aggregate rating', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    formationService.getFormation.and.returnValue(of(formationDetail));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    formationService.getFormations.and.returnValue(of([]));
    const fixture = TestBed.createComponent(FormationDetailComponent);
    fixture.detectChanges();
    const tabButtons = fixture.nativeElement.querySelectorAll('.detail__tab');
    (tabButtons[2] as HTMLButtonElement).click();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Avis des étudiants');
    expect(text).toContain('12 avis');
  });

  it('should display the instructor tab with other courses', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    formationService.getFormation.and.returnValue(of(formationDetail));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    formationService.getFormations.and.returnValue(of([otherFormation]));
    const fixture = TestBed.createComponent(FormationDetailComponent);
    fixture.detectChanges();
    const tabButtons = fixture.nativeElement.querySelectorAll('.detail__tab');
    (tabButtons[3] as HTMLButtonElement).click();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Votre instructeur');
    expect(text).toContain('React Moderne');
  });

  it('should display the server error message when the formation cannot be loaded', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    formationService.getFormation.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 404, error: { message: 'Formation introuvable' } })),
    );
    const fixture = TestBed.createComponent(FormationDetailComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.detail__error-text')?.textContent).toContain(
      'Formation introuvable',
    );
  });
});
