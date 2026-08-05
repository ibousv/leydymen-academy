import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { STORAGE_KEYS } from '../../shared/constants';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should add the Authorization header when a token exists', () => {
    localStorage.setItem(STORAGE_KEYS.token, 'mock-token-1');
    http.get('/api/formations').subscribe();
    const req = httpTesting.expectOne('/api/formations');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token-1');
    req.flush({});
  });

  it('should not add the Authorization header when no token exists', () => {
    http.get('/api/formations').subscribe();
    const req = httpTesting.expectOne('/api/formations');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should not add the Authorization header to a refresh-token request', () => {
    localStorage.setItem(STORAGE_KEYS.token, 'mock-token-1');
    http.post('/api/auth/refresh-token', { refreshToken: 'mock-refresh-1' }).subscribe();
    const req = httpTesting.expectOne('/api/auth/refresh-token');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
