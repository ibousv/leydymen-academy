import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ProfileEditComponent } from './profile-edit.component';
import { AuthService, UserService } from '../../../core/services';
import type { User } from '../../../core/models';

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

describe('ProfileEditComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', [
      'register',
      'login',
      'forgotPassword',
      'logout',
      'refreshToken',
      'getCurrentUser',
    ]);
    userService = jasmine.createSpyObj('UserService', [
      'getUsers',
      'getUser',
      'updateUser',
      'deleteUser',
      'changePassword',
      'uploadProfileImage',
    ]);
    authService.getCurrentUser.and.returnValue(of(user));
    await TestBed.configureTestingModule({
      imports: [ProfileEditComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: UserService, useValue: userService },
      ],
    }).compileComponents();
  });

  it('should prefill the form with the current user data', () => {
    const fixture = TestBed.createComponent(ProfileEditComponent);
    fixture.detectChanges();
    const firstNameInput = fixture.nativeElement.querySelector('input[placeholder="ex. Amadou"]') as HTMLInputElement;
    expect(firstNameInput.value).toBe('Amadou');
    const locationInput = fixture.nativeElement.querySelector('input[placeholder="ex. Dakar"]') as HTMLInputElement;
    expect(locationInput.value).toBe('Dakar');
    const bioTextarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(bioTextarea.value).toBe('Passionné de code');
  });

  it('should save the profile and show a success notice', () => {
    userService.updateUser.and.returnValue(of(user));
    const fixture = TestBed.createComponent(ProfileEditComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const saveButton = Array.from(buttons).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Enregistrer les modifications',
    ) as HTMLButtonElement;
    saveButton.click();
    fixture.detectChanges();
    expect(userService.updateUser).toHaveBeenCalledWith(
      3,
      jasmine.objectContaining({ firstName: 'Amadou', email: 'student1@leydymen.com' }),
    );
    expect(fixture.nativeElement.textContent).toContain('Profil mis à jour avec succès.');
  });

  it('should not save when the first name is empty', () => {
    userService.updateUser.and.returnValue(of(user));
    const fixture = TestBed.createComponent(ProfileEditComponent);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const firstNameInput = Array.from(inputs).find(
      (input) => (input as HTMLInputElement).placeholder === 'ex. Amadou',
    ) as HTMLInputElement;
    firstNameInput.value = '';
    firstNameInput.dispatchEvent(new Event('input'));
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const saveButton = Array.from(buttons).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Enregistrer les modifications',
    ) as HTMLButtonElement;
    saveButton.click();
    fixture.detectChanges();
    expect(userService.updateUser).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Le prénom est obligatoire.');
  });

  it('should change the password and reset the password form', () => {
    userService.changePassword.and.returnValue(of(undefined));
    const fixture = TestBed.createComponent(ProfileEditComponent);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const currentInput = Array.from(inputs).find(
      (input) => (input as HTMLInputElement).placeholder === 'Votre mot de passe actuel',
    ) as HTMLInputElement;
    currentInput.value = 'student123';
    currentInput.dispatchEvent(new Event('input'));
    const newInput = Array.from(inputs).find(
      (input) => (input as HTMLInputElement).placeholder === 'Nouveau mot de passe',
    ) as HTMLInputElement;
    newInput.value = 'nouveau123';
    newInput.dispatchEvent(new Event('input'));
    const confirmInput = Array.from(inputs).find(
      (input) => (input as HTMLInputElement).placeholder === 'Confirmer le nouveau mot de passe',
    ) as HTMLInputElement;
    confirmInput.value = 'nouveau123';
    confirmInput.dispatchEvent(new Event('input'));
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const saveButton = Array.from(buttons).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Changer le mot de passe',
    ) as HTMLButtonElement;
    saveButton.click();
    fixture.detectChanges();
    expect(userService.changePassword).toHaveBeenCalledWith({
      currentPassword: 'student123',
      newPassword: 'nouveau123',
      confirmPassword: 'nouveau123',
    });
    expect(fixture.nativeElement.textContent).toContain('Mot de passe modifié avec succès.');
  });

  it('should surface the API error message', () => {
    authService.getCurrentUser.and.returnValue(
      throwError(() => new HttpErrorResponse({ error: { message: 'Session expirée.' }, status: 401 })),
    );
    const fixture = TestBed.createComponent(ProfileEditComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Session expirée.');
  });
});
