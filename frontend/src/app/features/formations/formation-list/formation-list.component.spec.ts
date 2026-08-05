import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormationListComponent } from './formation-list.component';
import { AuthService, FormationService } from '../../../core/services';
import type { Formation, User } from '../../../core/models';

const adminUser: User = {
  id: 1,
  firstName: 'Admin',
  lastName: 'Academy',
  email: 'admin@leydymen.com',
  username: 'admin',
  role: 'ADMIN',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  lastActive: '2026-01-01T00:00:00Z',
};

const studentUser: User = {
  ...adminUser,
  id: 3,
  firstName: 'Amadou',
  lastName: 'Diallo',
  email: 'student1@leydymen.com',
  username: 'student1',
  role: 'STUDENT',
};

function makeFormation(id: number): Formation {
  return {
    id,
    title: `Formation ${id}`,
    description: 'Description',
    category: 'Développement Web',
    level: 'intermediaire',
    price: 450000,
    status: 'published',
    instructorId: 2,
    instructor: { id: 2, firstName: 'Fatou', lastName: 'Ndiaye', email: 'instructor@leydymen.com' },
    rating: 4.5,
    ratingCount: 10,
    studentsCount: 5,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T00:00:00Z',
    maxStudents: 50,
    objectives: [],
    requirements: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('FormationListComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let formationService: jasmine.SpyObj<FormationService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    formationService = jasmine.createSpyObj('FormationService', [
      'getFormations',
      'getFormation',
      'createFormation',
      'updateFormation',
      'deleteFormation',
      'searchFormations',
      'getFormationModules',
    ]);
    await TestBed.configureTestingModule({
      imports: [FormationListComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: FormationService, useValue: formationService },
      ],
    }).compileComponents();
  });

  it('should render formations as cards with title, instructor and price', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    formationService.getFormations.and.returnValue(of([makeFormation(1), makeFormation(2)]));
    const fixture = TestBed.createComponent(FormationListComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Formation 1');
    expect(text).toContain('Formation 2');
    expect(text).toContain('Fatou Ndiaye');
    expect(text).toContain('450');
    expect(text).toContain('FCFA');
  });

  it('should not show management filters and actions for a student', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    formationService.getFormations.and.returnValue(of([makeFormation(1)]));
    const fixture = TestBed.createComponent(FormationListComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).not.toContain('Statut');
    expect(text).not.toContain('Modifier');
    expect(text).not.toContain('Supprimer');
  });

  it('should show management actions for an admin', () => {
    authService.getCurrentUser.and.returnValue(of(adminUser));
    formationService.getFormations.and.returnValue(of([makeFormation(1)]));
    const fixture = TestBed.createComponent(FormationListComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Modifier');
    expect(text).toContain('Supprimer');
    expect(text).toContain('Dépublier');
    expect(text).toContain('Créer une formation');
  });

  it('should reload with the search keyword on search submit', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    formationService.getFormations.and.returnValue(of([makeFormation(1)]));
    const fixture = TestBed.createComponent(FormationListComponent);
    fixture.detectChanges();
    formationService.getFormations.calls.reset();
    const input = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'Angular';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const searchButton = Array.from(buttons).find((button) => (button as HTMLButtonElement).textContent?.includes('Rechercher'));
    (searchButton as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(formationService.getFormations).toHaveBeenCalledWith(jasmine.objectContaining({ search: 'Angular' }));
  });

  it('should reload with the selected category filter', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    formationService.getFormations.and.returnValue(of([makeFormation(1)]));
    const fixture = TestBed.createComponent(FormationListComponent);
    fixture.detectChanges();
    formationService.getFormations.calls.reset();
    const selects = fixture.nativeElement.querySelectorAll('select');
    const categorySelect = selects[0] as HTMLSelectElement;
    categorySelect.value = '1';
    categorySelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(formationService.getFormations).toHaveBeenCalledWith(
      jasmine.objectContaining({ category: 'Développement Web' }),
    );
  });

  it('should switch between grid and list views', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    formationService.getFormations.and.returnValue(of([makeFormation(1)]));
    const fixture = TestBed.createComponent(FormationListComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.formations__grid')).not.toBeNull();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const listButton = Array.from(buttons).find((button) => (button as HTMLButtonElement).textContent?.includes('Liste'));
    (listButton as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.formations__grid')).toBeNull();
    expect(fixture.nativeElement.querySelector('.table')).not.toBeNull();
  });

  it('should paginate the formation list', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    const manyFormations = Array.from({ length: 12 }, (_, index) => makeFormation(index + 1));
    formationService.getFormations.and.returnValue(of(manyFormations));
    const fixture = TestBed.createComponent(FormationListComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.formations__grid app-card').length).toBe(9);
    const nextButton = Array.from(fixture.nativeElement.querySelectorAll('.pagination__btn')).find(
      (button) => (button as HTMLButtonElement).textContent?.includes('Suivant'),
    );
    (nextButton as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.formations__grid app-card').length).toBe(3);
  });

  it('should delete a formation after confirmation in the modal', () => {
    authService.getCurrentUser.and.returnValue(of(adminUser));
    formationService.getFormations.and.returnValue(of([makeFormation(1)]));
    formationService.deleteFormation.and.returnValue(of(undefined));
    const fixture = TestBed.createComponent(FormationListComponent);
    fixture.detectChanges();
    const deleteButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (button) => (button as HTMLButtonElement).textContent?.includes('Supprimer'),
    );
    (deleteButton as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal')).not.toBeNull();
    const modalButtons = fixture.nativeElement.querySelectorAll('.modal button');
    const confirmButton = modalButtons[modalButtons.length - 1] as HTMLButtonElement;
    confirmButton.click();
    fixture.detectChanges();
    expect(formationService.deleteFormation).toHaveBeenCalledWith(1);
    expect(fixture.nativeElement.querySelector('.formations__notice')?.textContent).toContain('Formation supprimée.');
  });

  it('should toggle the publication status of a formation', () => {
    authService.getCurrentUser.and.returnValue(of(adminUser));
    formationService.getFormations.and.returnValue(of([makeFormation(1)]));
    formationService.updateFormation.and.returnValue(of({ ...makeFormation(1), status: 'draft' }));
    const fixture = TestBed.createComponent(FormationListComponent);
    fixture.detectChanges();
    const unpublishButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (button) => (button as HTMLButtonElement).textContent?.includes('Dépublier'),
    );
    (unpublishButton as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(formationService.updateFormation).toHaveBeenCalledWith(1, { status: 'draft' });
  });

  it('should display an empty state with a create CTA for staff', () => {
    authService.getCurrentUser.and.returnValue(of(adminUser));
    formationService.getFormations.and.returnValue(of([]));
    const fixture = TestBed.createComponent(FormationListComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.formations__empty-text')?.textContent).toContain(
      'Aucune formation ne correspond',
    );
    expect(fixture.nativeElement.querySelector('.formations__empty button')?.textContent).toContain(
      'Créer une formation',
    );
  });

  it('should display the server error message on failure', () => {
    authService.getCurrentUser.and.returnValue(of(studentUser));
    formationService.getFormations.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: { message: 'Erreur serveur' } })),
    );
    const fixture = TestBed.createComponent(FormationListComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.formations__error-text')?.textContent).toContain('Erreur serveur');
  });
});
