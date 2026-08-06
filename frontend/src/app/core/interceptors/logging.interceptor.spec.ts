import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { loggingInterceptor } from './logging.interceptor';

describe('loggingInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([loggingInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should log the request method, url and status in development', () => {
    spyOn(console, 'log');
    http.get('/api/formations').subscribe();
    httpTesting.expectOne('/api/formations').flush({});

    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching(/\[HTTP\] GET \/api\/formations -> 200/));
  });
});
