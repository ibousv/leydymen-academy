import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LoadingService } from '../services/loading.service';
import { loadingInterceptor } from './loading.interceptor';

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([loadingInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should set loading while a request is pending and clear it on completion', () => {
    expect(loadingService.isLoading()).toBeFalse();

    http.get('/api/formations').subscribe();
    expect(loadingService.isLoading()).toBeTrue();

    httpTesting.expectOne('/api/formations').flush({});
    expect(loadingService.isLoading()).toBeFalse();
  });

  it('should clear loading when the request fails', () => {
    http.get('/api/formations').subscribe({ error: () => undefined });
    expect(loadingService.isLoading()).toBeTrue();

    httpTesting.expectOne('/api/formations').flush({ message: 'Erreur' }, { status: 500, statusText: 'Internal Server Error' });
    expect(loadingService.isLoading()).toBeFalse();
  });
});
