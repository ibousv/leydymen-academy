import { HttpClient } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  let service: ProgressService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProgressService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should track lesson progress', () => {
    let emitted = false;
    service.trackLessonProgress(12, 45).subscribe(() => (emitted = true));
    const req = httpTesting.expectOne((r) => r.url.endsWith('/progress/lessons/12') && r.method === 'POST');
    expect(req.request.body['percent']).toBe(45);
    req.flush({ lessonId: 12, percent: 45, completed: false, updatedAt: '2026-07-31T00:00:00.000Z' });
    expect(emitted).toBeTrue();
  });

  it('should mark a lesson as complete', () => {
    service.markLessonAsComplete(12).subscribe();
    const req = httpTesting.expectOne((r) => r.url.endsWith('/progress/lessons/12/complete') && r.method === 'POST');
    req.flush({ lessonId: 12, percent: 100, completed: true, updatedAt: '2026-07-31T00:00:00.000Z' });
  });

  it('should fetch the formation progress', () => {
    service.getFormationProgress(3).subscribe();
    httpTesting
      .expectOne((r) => r.url.endsWith('/progress/formation/3') && r.method === 'GET')
      .flush({ formationId: 3, completionPercent: 25 });
  });

  it('should fetch the lesson progress', () => {
    service.getLessonProgress(12).subscribe();
    httpTesting
      .expectOne((r) => r.url.endsWith('/progress/lesson/12') && r.method === 'GET')
      .flush({ lessonId: 12, percent: 0, completed: false, updatedAt: '' });
  });
});
