import { HttpClient } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StatisticsService } from './statistics.service';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StatisticsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should fetch dashboard statistics', () => {
    service.getDashboardStats().subscribe();
    httpTesting.expectOne((r) => r.url.endsWith('/statistics/dashboard') && r.method === 'GET').flush({ totalUsers: 10 });
  });

  it('should fetch formation statistics', () => {
    service.getFormationStats(3).subscribe();
    httpTesting
      .expectOne((r) => r.url.endsWith('/statistics/formation/3') && r.method === 'GET')
      .flush({ formationId: 3, totalEnrollments: 5 });
  });

  it('should fetch user statistics', () => {
    service.getUserStats(2).subscribe();
    httpTesting
      .expectOne((r) => r.url.endsWith('/statistics/user/2') && r.method === 'GET')
      .flush({ userId: 2, totalEnrollments: 3 });
  });

  it('should fetch revenue statistics', () => {
    service.getRevenueStats().subscribe();
    httpTesting.expectOne((r) => r.url.endsWith('/statistics/revenue') && r.method === 'GET').flush({ totalRevenue: 1000 });
  });
});
