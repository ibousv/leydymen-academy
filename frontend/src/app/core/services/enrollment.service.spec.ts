import { HttpClient } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EnrollmentService } from './enrollment.service';

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EnrollmentService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should fetch enrollments with filters', () => {
    service.getEnrollments({ status: 'in_progress' }).subscribe();
    const req = httpTesting.expectOne((r) => r.url.endsWith('/enrollments') && r.method === 'GET');
    expect(req.request.params.get('status')).toBe('in_progress');
    req.flush([]);
  });

  it('should fetch a single enrollment', () => {
    service.getEnrollment(7).subscribe();
    httpTesting.expectOne((r) => r.url.endsWith('/enrollments/7') && r.method === 'GET').flush({ id: 7 });
  });

  it('should enroll in a formation', () => {
    service.enrollFormation(3).subscribe();
    const req = httpTesting.expectOne((r) => r.url.endsWith('/enrollments') && r.method === 'POST');
    expect(req.request.body['formationId']).toBe(3);
    req.flush({ id: 7, formationId: 3, status: 'in_progress' });
  });

  it('should cancel an enrollment', () => {
    service.cancelEnrollment(7).subscribe();
    httpTesting.expectOne((r) => r.url.endsWith('/enrollments/7') && r.method === 'DELETE').flush(null, { status: 204, statusText: 'No Content' });
  });

  it('should update the status of an enrollment', () => {
    service.updateEnrollmentStatus(7, 'completed').subscribe();
    const req = httpTesting.expectOne((r) => r.url.endsWith('/enrollments/7/status') && r.method === 'PATCH');
    expect(req.request.body['status']).toBe('completed');
    req.flush({ id: 7, status: 'completed' });
  });

  it('should fetch the progress of an enrollment', () => {
    service.getEnrollmentProgress(7).subscribe();
    httpTesting.expectOne((r) => r.url.endsWith('/enrollments/7/progress') && r.method === 'GET').flush({ formationId: 3, completionPercent: 50 });
  });
});
