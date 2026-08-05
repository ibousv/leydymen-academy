import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { StudentDetailComponent } from './student-detail.component';
import { EnrollmentService, StatisticsService, UserService } from '../../../core/services';
import type { Enrollment, User, UserStats } from '../../../core/models';

function makeStudent(): User {
  return {
    id: 3,
    firstName: 'Amadou',
    lastName: 'Diallo',
    email: 'student1@leydymen.com',
    username: 'student1',
    role: 'STUDENT',
    status: 'active',
    bio: 'Étudiant en développement web.',
    createdAt: '2026-01-01T00:00:00Z',
    lastActive: '2026-02-01T00:00:00Z',
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
    ...overrides,
  };
}

function makeStats(): UserStats {
  return {
    userId: 3,
    totalEnrollments: 2,
    completedCourses: 1,
    inProgressCourses: 1,
    droppedCourses: 0,
    averageCompletion: 62,
    recentActivity: [
      { id: 1, type: 'enrollment', message: 'Inscription à Développement Web', date: '2026-02-10T00:00:00Z' },
    ],
    lessonProgress: [],
  };
}

function makeRouteStub(): { paramMap: Observable<{ get: (key: string) => string | null }> } {
  return { paramMap: of({ get: (key: string) => (key === 'id' ? '3' : null) }) };
}

describe('StudentDetailComponent', () => {
  let userService: jasmine.SpyObj<UserService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let statisticsService: jasmine.SpyObj<StatisticsService>;

  beforeEach(async () => {
    userService = jasmine.createSpyObj('UserService', ['getUsers', 'getUser', 'updateUser', 'deleteUser']);
    enrollmentService = jasmine.createSpyObj('EnrollmentService', ['getEnrollments']);
    statisticsService = jasmine.createSpyObj('StatisticsService', [
      'getUserStats',
      'getDashboardStats',
      'getFormationStats',
    ]);
    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: makeRouteStub() },
        { provide: UserService, useValue: userService },
        { provide: EnrollmentService, useValue: enrollmentService },
        { provide: StatisticsService, useValue: statisticsService },
      ],
    }).compileComponents();
  });

  it('should render the student profile with identity, dates and status', () => {
    userService.getUser.and.returnValue(of(makeStudent()));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    statisticsService.getUserStats.and.returnValue(of(makeStats()));
    const fixture = TestBed.createComponent(StudentDetailComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Amadou Diallo');
    expect(text).toContain('student1@leydymen.com');
    expect(text).toContain('Actif');
    expect(text).toContain('STUDENT');
    expect(text).toContain('1 janvier 2026');
  });

  it('should render the performance KPIs and the activity timeline', () => {
    userService.getUser.and.returnValue(of(makeStudent()));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    statisticsService.getUserStats.and.returnValue(of(makeStats()));
    const fixture = TestBed.createComponent(StudentDetailComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Taux de complétion');
    expect(text).toContain('62%');
    expect(text).toContain('Cours terminés');
    expect(text).toContain('Inscription à Développement Web');
  });

  it('should render enrollments with status, progression and grade', () => {
    userService.getUser.and.returnValue(of(makeStudent()));
    enrollmentService.getEnrollments.and.returnValue(
      of([
        makeEnrollment(10, { status: 'completed', completionPercent: 100, grade: 16 }),
        makeEnrollment(11, { status: 'in_progress', completionPercent: 40, grade: null }),
      ]),
    );
    statisticsService.getUserStats.and.returnValue(of(makeStats()));
    const fixture = TestBed.createComponent(StudentDetailComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Terminée');
    expect(text).toContain('En cours');
    expect(text).toContain('100%');
    expect(text).toContain('16/20');
    expect(text).toContain('—');
  });

  it('should call the student API with the id from the route', () => {
    userService.getUser.and.returnValue(of(makeStudent()));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    statisticsService.getUserStats.and.returnValue(of(makeStats()));
    const fixture = TestBed.createComponent(StudentDetailComponent);
    fixture.detectChanges();
    expect(userService.getUser).toHaveBeenCalledWith(3);
    expect(enrollmentService.getEnrollments).toHaveBeenCalledWith({ studentId: 3 });
    expect(statisticsService.getUserStats).toHaveBeenCalledWith(3);
  });

  it('should deactivate the student and reload the profile', () => {
    userService.getUser.and.returnValue(of(makeStudent()));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    statisticsService.getUserStats.and.returnValue(of(makeStats()));
    userService.updateUser.and.returnValue(of(makeStudent()));
    const fixture = TestBed.createComponent(StudentDetailComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const deactivateButton = Array.from(buttons).find((button) =>
      (button as HTMLButtonElement).textContent?.includes('Désactiver'),
    );
    (deactivateButton as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(userService.updateUser).toHaveBeenCalledWith(3, { status: 'inactive' });
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('a été désactivé');
  });

  it('should show the API error message when the student cannot be loaded', () => {
    userService.getUser.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 404, error: { message: 'Utilisateur introuvable' } })),
    );
    statisticsService.getUserStats.and.returnValue(of(makeStats()));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    const fixture = TestBed.createComponent(StudentDetailComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Utilisateur introuvable');
  });
});
