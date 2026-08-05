import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { StatisticsService } from '../../../core/services';
import type { DashboardStats } from '../../../core/models';

const stats: DashboardStats = {
  totalUsers: 12,
  totalStudents: 8,
  totalInstructors: 3,
  totalAdmins: 1,
  totalFormations: 6,
  totalEnrollments: 7,
  totalRevenue: 2700000,
  activeEnrollments: 5,
  completedEnrollments: 1,
  recentActivity: [
    { id: 1, type: 'inscription', message: 'Amadou Diallo s\'est inscrit à Développement Web', date: '2026-02-01T00:00:00Z' },
  ],
  topFormations: [{ formationId: 1, title: 'Développement Web', enrollments: 4 }],
  recentUsers: [],
  enrollmentsOverTime: [
    { month: '2026-01', count: 2 },
    { month: '2026-02', count: 3 },
  ],
  studentDistribution: [{ level: 'debutant', count: 4 }],
  revenueByFormation: [{ formationId: 1, title: 'Développement Web', revenue: 1800000 }],
};

describe('AdminDashboardComponent', () => {
  let statisticsService: jasmine.SpyObj<StatisticsService>;

  beforeEach(async () => {
    statisticsService = jasmine.createSpyObj('StatisticsService', [
      'getDashboardStats',
      'getFormationStats',
      'getUserStats',
      'getRevenueStats',
    ]);
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [{ provide: StatisticsService, useValue: statisticsService }],
    }).compileComponents();
  });

  it('should render the KPI cards and the activity feed', () => {
    statisticsService.getDashboardStats.and.returnValue(of(stats));
    const fixture = TestBed.createComponent(AdminDashboardComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('12');
    expect(text).toContain('6');
    expect(text).toContain('7');
    expect(text).toContain('2\u202F700\u202F000 FCFA');
    expect(text).toContain('+50%');
    expect(text).toContain('Développement Web');
  });

  it('should surface the API error message', () => {
    statisticsService.getDashboardStats.and.returnValue(
      throwError(() => new HttpErrorResponse({ error: { message: 'Accès refusé.' }, status: 403 })),
    );
    const fixture = TestBed.createComponent(AdminDashboardComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Accès refusé.');
  });
});
