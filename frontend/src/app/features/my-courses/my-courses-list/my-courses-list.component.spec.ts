import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MyCoursesListComponent } from './my-courses-list.component';
import { EnrollmentService, FormationService } from '../../../core/services';
import type { Enrollment, Formation, User } from '../../../core/models';

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
    grade: null,
    formation: makeFormation(1, 'Développement Web'),
    student: studentUser,
    ...overrides,
  };
}

describe('MyCoursesListComponent', () => {
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let formationService: jasmine.SpyObj<FormationService>;

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
    await TestBed.configureTestingModule({
      imports: [MyCoursesListComponent],
      providers: [
        provideRouter([]),
        { provide: EnrollmentService, useValue: enrollmentService },
        { provide: FormationService, useValue: formationService },
      ],
    }).compileComponents();
  });

  it('should render the tabs and the in-progress course cards', () => {
    enrollmentService.getEnrollments.and.returnValue(of([makeEnrollment(10)]));
    formationService.getFormations.and.returnValue(of([makeFormation(1, 'Développement Web')]));
    const fixture = TestBed.createComponent(MyCoursesListComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('En cours');
    expect(text).toContain('Terminés');
    expect(text).toContain('Développement Web');
    expect(text).toContain('50%');
    expect(text).toContain('Continuer');
  });

  it('should filter the cards by tab and search keyword', () => {
    enrollmentService.getEnrollments.and.returnValue(
      of([
        makeEnrollment(10, { status: 'in_progress', completionPercent: 30 }),
        makeEnrollment(11, { status: 'completed', completionPercent: 100 }),
      ]),
    );
    formationService.getFormations.and.returnValue(of([]));
    const fixture = TestBed.createComponent(MyCoursesListComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Développement Web');
    const input = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'Introuvable';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Aucun cours');
  });

  it('should show only completed courses on the completed tab', () => {
    enrollmentService.getEnrollments.and.returnValue(
      of([
        makeEnrollment(10, { status: 'in_progress', completionPercent: 30 }),
        makeEnrollment(11, { status: 'completed', completionPercent: 100 }),
      ]),
    );
    formationService.getFormations.and.returnValue(of([]));
    const fixture = TestBed.createComponent(MyCoursesListComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const completedTab = Array.from(buttons).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Terminés',
    );
    (completedTab as HTMLButtonElement).click();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('100%');
    expect(text).not.toContain('Abandonner');
  });

  it('should sort the cards by progress', () => {
    enrollmentService.getEnrollments.and.returnValue(
      of([
        makeEnrollment(10, { completionPercent: 30 }),
        makeEnrollment(11, { completionPercent: 80 }),
      ]),
    );
    formationService.getFormations.and.returnValue(of([]));
    const fixture = TestBed.createComponent(MyCoursesListComponent);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelectorAll('select')[0] as HTMLSelectElement;
    select.value = '2';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text.indexOf('80%')).toBeLessThan(text.indexOf('30%'));
  });

  it('should recommend published formations that are not enrolled', () => {
    enrollmentService.getEnrollments.and.returnValue(of([makeEnrollment(10)]));
    formationService.getFormations.and.returnValue(
      of([makeFormation(1, 'Développement Web'), makeFormation(2, 'Mobile'), makeFormation(3, 'Cloud')]),
    );
    const fixture = TestBed.createComponent(MyCoursesListComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Formations recommandées');
    expect(text).toContain('Mobile');
    expect(text).toContain('Cloud');
  });

  it('should show an empty state when the student has no courses', () => {
    enrollmentService.getEnrollments.and.returnValue(of([]));
    formationService.getFormations.and.returnValue(of([]));
    const fixture = TestBed.createComponent(MyCoursesListComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Aucun cours');
  });
});
