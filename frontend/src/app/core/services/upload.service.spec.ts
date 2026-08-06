import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UploadService } from './upload.service';

describe('UploadService', () => {
  let service: UploadService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UploadService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should upload an image as multipart form data', () => {
    const file = new File(['image-bytes'], 'cover.png', { type: 'image/png' });
    let url: string | undefined;
    service.uploadImage(file).subscribe((response) => (url = response.url));

    const req = httpTesting.expectOne('http://localhost:4000/api/uploads/images');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    expect(req.request.headers.has('Content-Type')).toBeFalse();
    req.flush({ url: 'http://localhost:4000/uploads/123-cover.png' });

    expect(url).toBe('http://localhost:4000/uploads/123-cover.png');
  });

  it('should upload a video as multipart form data', () => {
    const file = new File(['video-bytes'], 'lesson.mp4', { type: 'video/mp4' });
    let url: string | undefined;
    service.uploadVideo(file).subscribe((response) => (url = response.url));

    const req = httpTesting.expectOne('http://localhost:4000/api/uploads/videos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    req.flush({ url: 'http://localhost:4000/uploads/456-lesson.mp4' });

    expect(url).toBe('http://localhost:4000/uploads/456-lesson.mp4');
  });
});
