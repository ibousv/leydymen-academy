import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminUsersComponent } from './admin-users.component';
import { StatisticsService, UserService } from '../../../core/services';
import type { User, UserStats } from '../../../core/models';

const users: User[] = [
  {
    id: 1,
    firstName: 'Awa',
    lastName: 'Ba',
    email: 'awa@leydymen.com',
    username: 'awa',
    role: 'ADMIN',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    lastActive: '2026-02-01T00:00:00Z',
  },
  {
    id: 2,
    firstName: 'Fatou',
    lastName: 'Ndiaye',
    email: 'fatou@leydymen.com',
    username: 'fatou',
    role: 'INSTRUCTOR',
    status: 'active',
    createdAt: '2026-01-02T00:00:00Z',
    lastActive: '2026-02-01T00:00:00Z',
  },
  {
    id: 3,
    firstName: 'Amadou',
    lastName: 'Diallo',
    email: 'amadou@leydymen.com',
    username: 'amadou',
    role: 'STUDENT',
    status: 'banned',
    createdAt: '2026-01-03T00:00:00Z',
    lastActive: '2026-02-01T00:00:00Z',
  },
];

const activity: UserStats = {
  userId: 3,
  totalEnrollments: 2,
  completedCourses: 1,
  inProgressCourses: 1,
  droppedCourses: 0,
  averageCompletion: 50,
  recentActivity: [{ id: 1, type: 'inscription', message: 'Inscription à Développement Web', date: '2026-01-15T00:00:00Z' }],
  lessonProgress: [],
};

describe('AdminUsersComponent', () => {
  let userService: jasmine.SpyObj<UserService>;
  let statisticsService: jasmine.SpyObj<StatisticsService>;

  beforeEach(async () => {
    userService = jasmine.createSpyObj('UserService', [
      'getUsers',
      'getUser',
      'updateUser',
      'deleteUser',
      'changePassword',
      'uploadProfileImage',
    ]);
    statisticsService = jasmine.createSpyObj('StatisticsService', [
      'getDashboardStats',
      'getFormationStats',
      'getUserStats',
      'getRevenueStats',
    ]);
    userService.getUsers.and.returnValue(of(users));
    await TestBed.configureTestingModule({
      imports: [AdminUsersComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userService },
        { provide: StatisticsService, useValue: statisticsService },
      ],
    }).compileComponents();
  });

  it('should render the user table', () => {
    const fixture = TestBed.createComponent(AdminUsersComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Awa Ba');
    expect(text).toContain('fatou@leydymen.com');
    expect(text).toContain('Banni');
  });

  it('should change the role of a user', () => {
    userService.updateUser.and.returnValue(of({ ...users[2], role: 'INSTRUCTOR' }));
    const fixture = TestBed.createComponent(AdminUsersComponent);
    fixture.detectChanges();
    const selects = fixture.nativeElement.querySelectorAll('select');
    const roleSelect = Array.from(selects).find(
      (select) => (select as HTMLSelectElement).getAttribute('aria-label') === 'Rôle de Amadou',
    ) as HTMLSelectElement;
    roleSelect.value = 'INSTRUCTOR';
    roleSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(userService.updateUser).toHaveBeenCalledWith(3, { role: 'INSTRUCTOR' });
    expect(fixture.nativeElement.textContent).toContain('Rôle de Amadou Diallo mis à jour.');
  });

  it('should ban a user', () => {
    userService.updateUser.and.returnValue(of({ ...users[2], status: 'banned' }));
    const fixture = TestBed.createComponent(AdminUsersComponent);
    fixture.detectChanges();
    const rowButtons = fixture.nativeElement.querySelectorAll('tbody button');
    const banButton = Array.from(rowButtons).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Bannir',
    ) as HTMLButtonElement;
    banButton.click();
    fixture.detectChanges();
    expect(userService.updateUser).toHaveBeenCalledWith(1, { status: 'banned' });
    expect(fixture.nativeElement.textContent).toContain('banni');
  });

  it('should delete a user', () => {
    userService.deleteUser.and.returnValue(of(undefined));
    const fixture = TestBed.createComponent(AdminUsersComponent);
    fixture.detectChanges();
    const rowButtons = fixture.nativeElement.querySelectorAll('tbody button');
    const deleteButtons = Array.from(rowButtons).filter(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Supprimer',
    );
    (deleteButtons[2] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(userService.deleteUser).toHaveBeenCalledWith(3);
    expect(fixture.nativeElement.textContent).not.toContain('amadou@leydymen.com');
  });

  it('should open the activity modal for a user', () => {
    statisticsService.getUserStats.and.returnValue(of(activity));
    const fixture = TestBed.createComponent(AdminUsersComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const activityButton = Array.from(buttons).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Activité',
    ) as HTMLButtonElement;
    activityButton.click();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Activité de Awa Ba');
    expect(text).toContain('2');
    expect(text).toContain('50%');
  });

  it('should filter the table by search keyword', () => {
    const fixture = TestBed.createComponent(AdminUsersComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'Fatou';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Fatou Ndiaye');
    expect(text).not.toContain('Awa Ba');
  });
});
