import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AdminStatisticsComponent } from './admin-statistics.component';
import { StatisticsService } from '../../../core/services';
import type { DashboardStats, RevenueStats } from '../../../core/models';

const dashboard: DashboardStats = {
  totalUsers: 12,
  totalStudents: 8,
  totalInstructors: 3,
  totalAdmins: 1,
  totalFormations: 6,
  totalEnrollments: 7,
  totalRevenue: 2700000,
  activeEnrollments: 5,
  completedEnrollments: 1,
  recentActivity: [],
  topFormations: [{ formationId: 1, title: 'Développement Web', enrollments: 4 }],
  recentUsers: [
    { id: 3, firstName: 'Amadou', lastName: 'Diallo', email: 'amadou@leydymen.com', username: 'amadou', role: 'STUDENT', status: 'active', createdAt: '2026-02-01T00:00:00Z', lastActive: '2026-02-01T00:00:00Z' },
  ],
  enrollmentsOverTime: [{ month: '2026-01', count: 2 }],
  studentDistribution: [{ level: 'debutant', count: 4 }],
  revenueByFormation: [{ formationId: 1, title: 'Développement Web', revenue: 1800000 }],
};

const revenue: RevenueStats = {
  totalRevenue: 2700000,
  averageOrderValue: 385714,
  revenueByFormation: [{ formationId: 1, title: 'Développement Web', revenue: 1800000 }],
  revenueTrend: [{ month: '2026-01', revenue: 900000 }],
  paidEnrollments: 7,
};

describe('AdminStatisticsComponent', () => {
  let statisticsService: jasmine.SpyObj<StatisticsService>;

  beforeEach(async () => {
    statisticsService = jasmine.createSpyObj('StatisticsService', [
      'getDashboardStats',
      'getFormationStats',
      'getUserStats',
      'getRevenueStats',
    ]);
    await TestBed.configureTestingModule({
      imports: [AdminStatisticsComponent],
      providers: [{ provide: StatisticsService, useValue: statisticsService }],
    }).compileComponents();
  });

  it('should render the overview, analytics and the recent users', () => {
    statisticsService.getDashboardStats.and.returnValue(of(dashboard));
    statisticsService.getRevenueStats.and.returnValue(of(revenue));
    const fixture = TestBed.createComponent(AdminStatisticsComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('12');
    expect(text).toContain('6');
    expect(text).toContain('2\u202F700\u202F000 FCFA');
    expect(text).toContain('Développement Web');
    expect(text).toContain('Débutant');
    expect(text).toContain('Amadou Diallo');
  });

  it('should surface the API error message', () => {
    statisticsService.getDashboardStats.and.returnValue(of(dashboard));
    statisticsService.getRevenueStats.and.returnValue(
      throwError(() => new HttpErrorResponse({ error: { message: 'Accès refusé.' }, status: 403 })),
    );
    const fixture = TestBed.createComponent(AdminStatisticsComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Accès refusé.');
  });
});
