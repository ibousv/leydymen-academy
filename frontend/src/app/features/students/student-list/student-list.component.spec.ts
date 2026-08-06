import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { StudentListComponent } from './student-list.component';
import { EnrollmentService, UserService } from '../../../core/services';
import type { Enrollment, User, UserStatus } from '../../../core/models';

function makeStudent(id: number, overrides: Partial<User> = {}): User {
  return {
    id,
    firstName: `Prénom${id}`,
    lastName: `Nom${id}`,
    email: `student${id}@leydymen.com`,
    username: `student${id}`,
    role: 'STUDENT',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    lastActive: '2026-02-01T00:00:00Z',
    ...overrides,
  };
}

function makeEnrollment(id: number, studentId: number): Enrollment {
  return {
    id,
    formationId: 1,
    studentId,
    status: 'in_progress',
    enrollmentDate: '2026-01-15T00:00:00Z',
    completionPercent: 50,
    grade: null,
  };
}

describe('StudentListComponent', () => {
  let userService: jasmine.SpyObj<UserService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;

  beforeEach(async () => {
    userService = jasmine.createSpyObj('UserService', ['getUsers', 'getUser', 'updateUser', 'deleteUser']);
    enrollmentService = jasmine.createSpyObj('EnrollmentService', ['getEnrollments']);
    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userService },
        { provide: EnrollmentService, useValue: enrollmentService },
      ],
    }).compileComponents();
  });

  it('should render students with name, email, status and enrollment count', () => {
    userService.getUsers.and.returnValue(of([makeStudent(1), makeStudent(2)]));
    enrollmentService.getEnrollments.and.returnValue(of([makeEnrollment(10, 1)]));
    const fixture = TestBed.createComponent(StudentListComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Prénom1 Nom1');
    expect(text).toContain('student1@leydymen.com');
    expect(text).toContain('Actif');
    expect(text).toContain('1');
  });

  it('should show an empty state when no student matches', () => {
    userService.getUsers.and.returnValue(of([]));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    const fixture = TestBed.createComponent(StudentListComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Aucun étudiant');
  });

  it('should reload with the search keyword and the STUDENT role', () => {
    userService.getUsers.and.returnValue(of([makeStudent(1)]));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    const fixture = TestBed.createComponent(StudentListComponent);
    fixture.detectChanges();
    userService.getUsers.calls.reset();
    const input = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'Diallo';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const searchButton = Array.from(buttons).find((button) =>
      (button as HTMLButtonElement).textContent?.includes('Rechercher'),
    );
    (searchButton as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(userService.getUsers).toHaveBeenCalledWith(
      jasmine.objectContaining({ search: 'Diallo', role: 'STUDENT' }),
    );
  });

  it('should reload with the selected status filter', () => {
    userService.getUsers.and.returnValue(of([makeStudent(1)]));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    const fixture = TestBed.createComponent(StudentListComponent);
    fixture.detectChanges();
    userService.getUsers.calls.reset();
    const select = fixture.nativeElement.querySelectorAll('select')[0] as HTMLSelectElement;
    select.value = '3';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(userService.getUsers).toHaveBeenCalledWith(jasmine.objectContaining({ status: 'banned' }));
  });

  it('should deactivate a student and show a notice', () => {
    userService.getUsers.and.returnValue(of([makeStudent(1)]));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    userService.updateUser.and.returnValue(of(makeStudent(1, { status: 'inactive' })));
    const fixture = TestBed.createComponent(StudentListComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const deactivateButton = Array.from(buttons).find((button) =>
      (button as HTMLButtonElement).textContent?.includes('Désactiver'),
    );
    (deactivateButton as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(userService.updateUser).toHaveBeenCalledWith(1, { status: 'inactive' });
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('a été désactivé');
  });

  it('should paginate when there are more students than the page size', () => {
    const students = Array.from({ length: 25 }, (_, index) => makeStudent(index + 1));
    userService.getUsers.and.returnValue(of(students));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    const fixture = TestBed.createComponent(StudentListComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Page 1 sur 3');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const pageButton = Array.from(buttons).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === '2',
    );
    (pageButton as HTMLButtonElement).click();
    fixture.detectChanges();
    const textAfter = fixture.nativeElement.textContent as string;
    expect(textAfter).toContain('Page 2 sur 3');
    expect(textAfter).toContain('Prénom19 Nom19');
    expect(textAfter).not.toContain('Prénom1 Nom1');
  });

  it('should track the selected students and enable the email action', () => {
    userService.getUsers.and.returnValue(of([makeStudent(1), makeStudent(2)]));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    const fixture = TestBed.createComponent(StudentListComponent);
    fixture.detectChanges();
    const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
    (checkboxes[1] as HTMLInputElement).click();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('1 étudiant(s) sélectionné(s)');
    const emailButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find((button) =>
      (button as HTMLButtonElement).textContent?.includes('Envoyer un email'),
    ) as HTMLButtonElement;
    expect(emailButton.disabled).toBe(false);
  });

  it('should export the filtered students as CSV', () => {
    userService.getUsers.and.returnValue(of([makeStudent(1)]));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    const anchor = document.createElement('a');
    spyOn(anchor, 'click');
    const originalCreateElement = document.createElement.bind(document);
    spyOn(document, 'createElement').and.callFake((tag: string) =>
      tag === 'a' ? anchor : originalCreateElement(tag),
    );
    spyOn(URL, 'createObjectURL').and.returnValue('blob:fake');
    const fixture = TestBed.createComponent(StudentListComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const exportButton = Array.from(buttons).find((button) =>
      (button as HTMLButtonElement).textContent?.includes('Exporter CSV'),
    );
    (exportButton as HTMLButtonElement).click();
    expect(anchor.download).toBe('etudiants.csv');
    expect(anchor.href).toContain('blob:fake');
  });

  it('should display inactive students without a deactivate action', () => {
    userService.getUsers.and.returnValue(of([makeStudent(1, { status: 'inactive' as UserStatus })]));
    enrollmentService.getEnrollments.and.returnValue(of([]));
    const fixture = TestBed.createComponent(StudentListComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Inactif');
    expect(text).not.toContain('Désactiver');
  });
});
