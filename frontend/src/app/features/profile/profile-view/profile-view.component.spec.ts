import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ProfileViewComponent } from './profile-view.component';
import { AuthService, EnrollmentService } from '../../../core/services';
import type { Enrollment, User } from '../../../core/models';

const user: User = {
  id: 3,
  firstName: 'Amadou',
  lastName: 'Diallo',
  email: 'student1@leydymen.com',
  username: 'student1',
  role: 'STUDENT',
  status: 'active',
  bio: 'Passionné de code',
  location: 'Dakar',
  website: 'https://amadou.dev',
  createdAt: '2026-01-01T00:00:00Z',
  lastActive: '2026-02-01T00:00:00Z',
};

function makeEnrollment(id: number, status: Enrollment['status']): Enrollment {
  return {
    id,
    formationId: 1,
    studentId: 3,
    status,
    enrollmentDate: '2026-01-15T00:00:00Z',
    completionPercent: status === 'completed' ? 100 : 50,
    grade: null,
  };
}

describe('ProfileViewComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', [
      'register',
      'login',
      'forgotPassword',
      'logout',
      'refreshToken',
      'getCurrentUser',
    ]);
    enrollmentService = jasmine.createSpyObj('EnrollmentService', [
      'getEnrollments',
      'getEnrollment',
      'enrollFormation',
      'cancelEnrollment',
      'updateEnrollmentStatus',
      'getEnrollmentProgress',
    ]);
    await TestBed.configureTestingModule({
      imports: [ProfileViewComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: EnrollmentService, useValue: enrollmentService },
      ],
    }).compileComponents();
  });

  it('should render the profile information and the course counters', () => {
    authService.getCurrentUser.and.returnValue(of(user));
    enrollmentService.getEnrollments.and.returnValue(
      of([makeEnrollment(10, 'in_progress'), makeEnrollment(11, 'completed'), makeEnrollment(12, 'dropped')]),
    );
    const fixture = TestBed.createComponent(ProfileViewComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Amadou Diallo');
    expect(text).toContain('@student1');
    expect(text).toContain('student1@leydymen.com');
    expect(text).toContain('Passionné de code');
    expect(text).toContain('Dakar');
    expect(text).toContain('3');
    expect(text).toContain('1');
    expect(text).toContain('Modifier le profil');
  });

  it('should show the initials when the user has no avatar', () => {
    authService.getCurrentUser.and.returnValue(of(user));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    const fixture = TestBed.createComponent(ProfileViewComponent);
    fixture.detectChanges();
    const avatar = fixture.nativeElement.querySelector('.profile-view__avatar span') as HTMLElement;
    expect(avatar.textContent).toBe('AD');
  });

  it('should surface the API error message', () => {
    authService.getCurrentUser.and.returnValue(
      throwError(() => new HttpErrorResponse({ error: { message: 'Session expirée.' }, status: 401 })),
    );
    enrollmentService.getEnrollments.and.returnValue(of([]));
    const fixture = TestBed.createComponent(ProfileViewComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Session expirée.');
  });
});
