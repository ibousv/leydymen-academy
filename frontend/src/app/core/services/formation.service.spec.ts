import { HttpClient } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormationService } from './formation.service';

describe('FormationService', () => {
  let service: FormationService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FormationService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should fetch formations with filters and return the items', () => {
    const paginated = { items: [{ id: 1 }], total: 1, page: 1, pageSize: 9 };
    let result: unknown;
    service.getFormations({ category: 'Développement Web', sort: 'newest' }).subscribe((formations) => (result = formations));

    const req = httpTesting.expectOne((r) => r.url.endsWith('/formations') && r.method === 'GET');
    expect(req.request.params.get('category')).toBe('Développement Web');
    expect(req.request.params.get('sort')).toBe('newest');
    req.flush(paginated);
    expect(result).toEqual(paginated.items);
  });

  it('should search formations by keyword', () => {
    service.searchFormations('angular').subscribe();
    const req = httpTesting.expectOne((r) => r.url.endsWith('/formations') && r.method === 'GET');
    expect(req.request.params.get('search')).toBe('angular');
    req.flush({ items: [], total: 0, page: 1, pageSize: 9 });
  });

  it('should fetch a formation detail', () => {
    service.getFormation(3).subscribe();
    const req = httpTesting.expectOne((r) => r.url.endsWith('/formations/3') && r.method === 'GET');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 3, modules: [] });
  });

  it('should create, update and delete a formation', () => {
    service
      .createFormation({
        title: 'Nouvelle',
        description: 'Description',
        category: 'Développement Web',
        level: 'debutant',
        price: 0,
        status: 'draft',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        maxStudents: 30,
        objectives: [],
        requirements: [],
      })
      .subscribe();
    const createReq = httpTesting.expectOne((r) => r.url.endsWith('/formations') && r.method === 'POST');
    expect(createReq.request.body['title']).toBe('Nouvelle');
    createReq.flush({ id: 5 });

    service.updateFormation(5, { price: 99 }).subscribe();
    const updateReq = httpTesting.expectOne((r) => r.url.endsWith('/formations/5') && r.method === 'PUT');
    expect(updateReq.request.body['price']).toBe(99);
    updateReq.flush({ id: 5, price: 99 });

    service.deleteFormation(5).subscribe();
    httpTesting.expectOne((r) => r.url.endsWith('/formations/5') && r.method === 'DELETE').flush(null, { status: 204, statusText: 'No Content' });
  });

  it('should fetch the modules of a formation', () => {
    service.getFormationModules(3).subscribe();
    httpTesting
      .expectOne((r) => r.url.endsWith('/formations/3/modules') && r.method === 'GET')
      .flush([{ id: 1, formationId: 3, title: 'Module 1', order: 1, lessons: [] }]);
  });
});
