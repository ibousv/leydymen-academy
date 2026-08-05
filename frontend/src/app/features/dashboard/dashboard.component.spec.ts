import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AuthService, EnrollmentService, FormationService, StatisticsService } from '../../core/services';
import type { DashboardStats, Enrollment, Formation, User, UserStats } from '../../core/models';

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

const instructorUser: User = {
  ...adminUser,
  id: 2,
  firstName: 'Fatou',
  lastName: 'Ndiaye',
  email: 'instructor@leydymen.com',
  username: 'instructor',
  role: 'INSTRUCTOR',
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

const formation: Formation = {
  id: 6,
  title: 'Développement Web Full-Stack',
  description: 'Description',
  category: 'Web',
  level: 'intermediaire',
  price: 450000,
  status: 'published',
  instructorId: 2,
  instructor: { id: 2, firstName: 'Fatou', lastName: 'Ndiaye', email: 'instructor@leydymen.com' },
  rating: 4.5,
  ratingCount: 12,
  studentsCount: 5,
  startDate: '2026-01-01T00:00:00Z',
  endDate: '2026-12-31T00:00:00Z',
  maxStudents: 50,
  objectives: [],
  requirements: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const recommendedFormation: Formation = {
  ...formation,
  id: 7,
  title: 'React Moderne',
  category: 'Frontend',
};

const dashboardStats: DashboardStats = {
  totalUsers: 10,
  totalStudents: 7,
  totalInstructors: 2,
  totalAdmins: 1,
  totalFormations: 4,
  totalEnrollments: 25,
  totalRevenue: 4500000,
  activeEnrollments: 15,
  completedEnrollments: 10,
  recentActivity: [
    { id: 1, type: 'enrollment', message: "Amadou Diallo s'est inscrit à « Développement Web »", date: '2026-07-30T10:00:00Z' },
  ],
  topFormations: [{ formationId: 6, title: 'Développement Web Full-Stack', enrollments: 12 }],
  recentUsers: [studentUser],
  enrollmentsOverTime: [{ month: '2026-07', count: 5 }],
  studentDistribution: [{ level: 'debutant', count: 3 }],
  revenueByFormation: [{ formationId: 6, title: 'Développement Web Full-Stack', revenue: 4500000 }],
};

const completedEnrollment: Enrollment = {
  id: 1,
  formationId: 6,
  studentId: 3,
  status: 'completed',
  enrollmentDate: '2026-07-01T00:00:00Z',
  completionPercent: 100,
  grade: 85,
  formation,
  student: studentUser,
};

const inProgressEnrollment: Enrollment = {
  ...completedEnrollment,
  id: 2,
  status: 'in_progress',
  enrollmentDate: '2026-07-15T00:00:00Z',
  completionPercent: 45,
};

const studentStats: UserStats = {
  userId: 3,
  totalEnrollments: 2,
  completedCourses: 1,
  inProgressCourses: 1,
  droppedCourses: 0,
  averageCompletion: 50,
  recentActivity: [
    { id: 1, type: 'enrollment', message: 'Inscription à « Développement Web »', date: '2026-07-15T00:00:00Z' },
  ],
  lessonProgress: [],
};

describe('DashboardComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let formationService: jasmine.SpyObj<FormationService>;
  let statisticsService: jasmine.SpyObj<StatisticsService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    enrollmentService = jasmine.createSpyObj('EnrollmentService', ['getEnrollments']);
    formationService = jasmine.createSpyObj('FormationService', ['getFormations']);
    statisticsService = jasmine.createSpyObj('StatisticsService', [
      'getDashboardStats',
      'getUserStats',
      'getFormationStats',
      'getRevenueStats',
    ]);
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: EnrollmentService, useValue: enrollmentService },
        { provide: FormationService, useValue: formationService },
        { provide: StatisticsService, useValue: statisticsService },
      ],
    }).compileComponents();
  });

  it('should render the dashboard title with the user welcome message', () => {
    authService.getCurrentUser.and.returnValue(of(adminUser));
    statisticsService.getDashboardStats.and.returnValue(of(dashboardStats));
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.page-header__title')?.textContent).toContain('Tableau de bord');
    expect(fixture.nativeElement.querySelector('.page-header__subtitle')?.textContent).toContain('Admin Academy');
  });

  it('should render ADMIN KPIs from the dashboard statistics', () => {
    authService.getCurrentUser.and.returnValue(of(adminUser));
    statisticsService.getDashboardStats.and.returnValue(of(dashboardStats));
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    const values = fixture.nativeElement.querySelectorAll('.kpi-card__value');
    expect(values.length).toBe(4);
    expect(values[0].textContent).toContain('10');
    expect(values[1].textContent).toContain('4');
    expect(values[2].textContent).toContain('25');
    expect(values[3].textContent).toContain('FCFA');
  });

  it('should render ADMIN activity, top formations and recent users', () => {
    authService.getCurrentUser.and.returnValue(of(adminUser));
    statisticsService.getDashboardStats.and.returnValue(of(dashboardStats));
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dashboard__activity-message')?.textContent).toContain('Amadou Diallo');
    expect(fixture.nativeElement.querySelector('.table')?.textContent).toContain('Développement Web Full-Stack');
    expect(fixture.nativeElement.querySelector('.dashboard__user-email')?.textContent).toContain('student1@leydymen.com');
  });

  it('should render INSTRUCTOR formations, recent enrollments and student performance', () => {
    authService.getCurrentUser.and.returnValue(of(instructorUser));
    enrollmentService.getEnrollments.and.returnValue(of([completedEnrollment]));
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Développement Web Full-Stack');
    expect(text).toContain("Amadou Diallo s'est inscrit à « Développement Web Full-Stack »");
    expect(text).toContain('Amadou Diallo');
    expect(fixture.nativeElement.querySelectorAll('.kpi-card__value')[0]?.textContent).toContain('1');
  });

  it('should render STUDENT in progress courses, learning statistics and recommendations', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    enrollmentService.getEnrollments.and.returnValue(of([completedEnrollment, inProgressEnrollment]));
    statisticsService.getUserStats.and.returnValue(of(studentStats));
    formationService.getFormations.and.returnValue(of([recommendedFormation]));
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('React Moderne');
    expect(text).toContain('Continuer');
    expect(text).toContain('Terminé');
    expect(text).toContain('En cours');
    const values = fixture.nativeElement.querySelectorAll('.kpi-card__value');
    expect(values[3].textContent).toContain('50%');
  });

  it('should display the server error message and a retry button on failure', () => {
    authService.getCurrentUser.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: { message: 'Erreur serveur' } })),
    );
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dashboard__error-text')?.textContent).toContain('Erreur serveur');
    expect(fixture.nativeElement.querySelector('button')?.textContent).toContain('Réessayer');
  });

  it('should show a loading skeleton while the data is being fetched', () => {
    authService.getCurrentUser.and.returnValue(new Subject<User>().asObservable());
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dashboard__loading')).not.toBeNull();
  });
});
