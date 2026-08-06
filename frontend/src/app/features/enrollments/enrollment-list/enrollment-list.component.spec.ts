import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EnrollmentListComponent } from './enrollment-list.component';
import { AuthService, EnrollmentService, FormationService } from '../../../core/services';
import type { Enrollment, Formation, User } from '../../../core/models';

const adminUser: User = {
  id: 1,
  firstName: 'Admin',
  lastName: 'Academy',
  email: 'admin@leydymen.com',
  username: 'admin',
  role: 'ADMIN',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  lastActive: '2026-01-01T00:00:00Z',
};

const studentUser: User = {
  ...adminUser,
  id: 3,
  firstName: 'Amadou',
  lastName: 'Diallo',
  email: 'student1@leydymen.com',
  username: 'student1',
  role: 'STUDENT',
};

function makeFormation(id: number, title: string): Formation {
  return {
    id,
    title,
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
  };
}

function makeEnrollment(id: number, overrides: Partial<Enrollment> = {}): Enrollment {
  return {
    id,
    formationId: 1,
    studentId: 3,
    status: 'in_progress',
    enrollmentDate: '2026-01-15T00:00:00Z',
    completionPercent: 50,
    grade: 14,
    formation: makeFormation(1, 'Développement Web'),
    student: studentUser,
    ...overrides,
  };
}

describe('EnrollmentListComponent', () => {
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
      imports: [EnrollmentListComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: EnrollmentService, useValue: enrollmentService },
        { provide: FormationService, useValue: formationService },
      ],
    }).compileComponents();
  });

  it('should render the student tabs and the enrollment cards', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    enrollmentService.getEnrollments.and.returnValue(of([makeEnrollment(10)]));
    const fixture = TestBed.createComponent(EnrollmentListComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('En cours');
    expect(text).toContain('Terminées');
    expect(text).toContain('Abandonnées');
    expect(text).toContain('Développement Web');
    expect(text).toContain('Fatou Ndiaye');
    expect(text).toContain('50%');
    expect(text).toContain('Continuer');
  });

  it('should filter the student cards by the active tab', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    enrollmentService.getEnrollments.and.returnValue(
      of([
        makeEnrollment(10, { status: 'completed', completionPercent: 100 }),
        makeEnrollment(11, { status: 'in_progress', completionPercent: 30 }),
      ]),
    );
    const fixture = TestBed.createComponent(EnrollmentListComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const completedTab = Array.from(buttons).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Terminées',
    );
    (completedTab as HTMLButtonElement).click();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Développement Web');
    expect(text).not.toContain('Abandonner le cours');
  });

  it('should sort the student cards by progress', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    enrollmentService.getEnrollments.and.returnValue(
      of([
        makeEnrollment(10, { completionPercent: 30 }),
        makeEnrollment(11, { completionPercent: 80 }),
      ]),
    );
    const fixture = TestBed.createComponent(EnrollmentListComponent);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelectorAll('select')[0] as HTMLSelectElement;
    select.value = '2';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text.indexOf('80%')).toBeLessThan(text.indexOf('30%'));
  });

  it('should drop a course from the student view', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    enrollmentService.getEnrollments.and.returnValue(of([makeEnrollment(10)]));
    enrollmentService.updateEnrollmentStatus.and.returnValue(
      of(makeEnrollment(10, { status: 'dropped' })),
    );
    const fixture = TestBed.createComponent(EnrollmentListComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const dropButton = Array.from(buttons).find((button) =>
      (button as HTMLButtonElement).textContent?.includes('Abandonner le cours'),
    );
    (dropButton as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(enrollmentService.updateEnrollmentStatus).toHaveBeenCalledWith(10, 'dropped');
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Vous avez abandonné');
  });

  it('should load the first formation and its enrollments for staff', () => {
    authService.getCurrentUser.and.returnValue(of(adminUser));
    formationService.getFormations.and.returnValue(of([makeFormation(1, 'Développement Web')]));
    enrollmentService.getEnrollments.and.returnValue(of([makeEnrollment(10)]));
    const fixture = TestBed.createComponent(EnrollmentListComponent);
    fixture.detectChanges();
    expect(formationService.getFormations).toHaveBeenCalled();
    expect(enrollmentService.getEnrollments).toHaveBeenCalledWith(
      jasmine.objectContaining({ formationId: 1 }),
    );
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Amadou Diallo');
    expect(text).toContain('14/20');
    expect(text).toContain('En cours');
  });

  it('should reload the enrollments when the staff selects another formation', () => {
    authService.getCurrentUser.and.returnValue(of(adminUser));
    formationService.getFormations.and.returnValue(of([makeFormation(1, 'Web'), makeFormation(2, 'Mobile')]));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    const fixture = TestBed.createComponent(EnrollmentListComponent);
    fixture.detectChanges();
    enrollmentService.getEnrollments.calls.reset();
    const select = fixture.nativeElement.querySelectorAll('select')[0] as HTMLSelectElement;
    select.value = '1';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(enrollmentService.getEnrollments).toHaveBeenCalledWith(
      jasmine.objectContaining({ formationId: 2 }),
    );
  });

  it('should mark an enrollment as completed from the staff view', () => {
    authService.getCurrentUser.and.returnValue(of(adminUser));
    formationService.getFormations.and.returnValue(of([makeFormation(1, 'Développement Web')]));
    enrollmentService.getEnrollments.and.returnValue(of([makeEnrollment(10)]));
    enrollmentService.updateEnrollmentStatus.and.returnValue(
      of(makeEnrollment(10, { status: 'completed' })),
    );
    const fixture = TestBed.createComponent(EnrollmentListComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const completeButton = Array.from(buttons).find((button) =>
      (button as HTMLButtonElement).textContent?.trim() === 'Terminée',
    );
    (completeButton as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(enrollmentService.updateEnrollmentStatus).toHaveBeenCalledWith(10, 'completed');
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('a été marquée comme terminée');
  });

  it('should apply a bulk status change to the selected enrollments', () => {
    authService.getCurrentUser.and.returnValue(of(adminUser));
    formationService.getFormations.and.returnValue(of([makeFormation(1, 'Développement Web')]));
    enrollmentService.getEnrollments.and.returnValue(of([makeEnrollment(10), makeEnrollment(11)]));
    enrollmentService.updateEnrollmentStatus.and.returnValue(
      of(makeEnrollment(10, { status: 'completed' })),
    );
    const fixture = TestBed.createComponent(EnrollmentListComponent);
    fixture.detectChanges();
    const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
    (checkboxes[1] as HTMLInputElement).click();
    fixture.detectChanges();
    const selects = fixture.nativeElement.querySelectorAll('select');
    const bulkSelect = selects[2] as HTMLSelectElement;
    bulkSelect.value = '2';
    bulkSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const applyButton = Array.from(buttons).find((button) =>
      (button as HTMLButtonElement).textContent?.trim() === 'Appliquer',
    );
    (applyButton as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(enrollmentService.updateEnrollmentStatus).toHaveBeenCalledWith(10, 'completed');
  });

  it('should export the selected enrollments as CSV', () => {
    authService.getCurrentUser.and.returnValue(of(adminUser));
    formationService.getFormations.and.returnValue(of([makeFormation(1, 'Développement Web')]));
    enrollmentService.getEnrollments.and.returnValue(of([makeEnrollment(10)]));
    const anchor = document.createElement('a');
    spyOn(anchor, 'click');
    const originalCreateElement = document.createElement.bind(document);
    spyOn(document, 'createElement').and.callFake((tag: string) =>
      tag === 'a' ? anchor : originalCreateElement(tag),
    );
    spyOn(URL, 'createObjectURL').and.returnValue('blob:fake');
    const fixture = TestBed.createComponent(EnrollmentListComponent);
    fixture.detectChanges();
    const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
    (checkboxes[1] as HTMLInputElement).click();
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const exportButton = Array.from(buttons).find((button) =>
      (button as HTMLButtonElement).textContent?.includes('Exporter CSV'),
    );
    (exportButton as HTMLButtonElement).click();
    expect(anchor.download).toBe('inscriptions.csv');
    expect(anchor.href).toContain('blob:fake');
  });

  it('should show an empty state when the selected formation has no enrollment', () => {
    authService.getCurrentUser.and.returnValue(of(adminUser));
    formationService.getFormations.and.returnValue(of([makeFormation(1, 'Développement Web')]));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    const fixture = TestBed.createComponent(EnrollmentListComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Aucune inscription');
  });
});
