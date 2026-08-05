import { HttpClient } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should fetch users with filters and return the items', () => {
    const paginated = { items: [{ id: 1 }], total: 1, page: 1, pageSize: 9 };
    let result: unknown;
    service.getUsers({ role: 'STUDENT', search: 'amadou' }).subscribe((users) => (result = users));

    const req = httpTesting.expectOne((r) => r.url.endsWith('/users') && r.method === 'GET');
    expect(req.request.params.get('role')).toBe('STUDENT');
    expect(req.request.params.get('search')).toBe('amadou');
    req.flush(paginated);
    expect(result).toEqual(paginated.items);
  });

  it('should fetch and update a user', () => {
    service.getUser(2).subscribe();
    httpTesting.expectOne((r) => r.url.endsWith('/users/2') && r.method === 'GET').flush({ id: 2 });

    service.updateUser(2, { bio: 'Nouvelle bio' }).subscribe();
    const req = httpTesting.expectOne((r) => r.url.endsWith('/users/2') && r.method === 'PUT');
    expect(req.request.body['bio']).toBe('Nouvelle bio');
    req.flush({ id: 2, bio: 'Nouvelle bio' });
  });

  it('should delete a user', () => {
    service.deleteUser(2).subscribe();
    httpTesting.expectOne((r) => r.url.endsWith('/users/2') && r.method === 'DELETE').flush(null, { status: 204, statusText: 'No Content' });
  });

  it('should change the password', () => {
    let emitted = false;
    service
      .changePassword({ currentPassword: 'old', newPassword: 'newpass', confirmPassword: 'newpass' })
      .subscribe(() => (emitted = true));
    const req = httpTesting.expectOne((r) => r.url.endsWith('/users/change-password') && r.method === 'POST');
    expect(req.request.body['newPassword']).toBe('newpass');
    req.flush({ message: 'Mot de passe modifié avec succès' });
    expect(emitted).toBeTrue();
  });

  it('should upload a profile image and return the image url', async () => {
    const withSpy = service as unknown as { fileToDataUrl(file: File): Promise<string> };
    spyOn(withSpy, 'fileToDataUrl').and.returnValue(Promise.resolve('data:image/png;base64,eA=='));
    let result = '';
    service.uploadProfileImage(new File(['x'], 'avatar.png', { type: 'image/png' })).subscribe((url) => (result = url));

    await Promise.resolve();
    const req = httpTesting.expectOne((r) => r.url.endsWith('/users/profile-image') && r.method === 'POST');
    expect(req.request.body['imageUrl']).toBe('data:image/png;base64,eA==');
    req.flush({ imageUrl: 'http://localhost:4000/uploads/avatar.png' });
    expect(result).toBe('http://localhost:4000/uploads/avatar.png');
  });
});
