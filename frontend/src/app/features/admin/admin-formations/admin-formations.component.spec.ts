import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminFormationsComponent } from './admin-formations.component';
import { FormationService } from '../../../core/services';
import type { Formation } from '../../../core/models';

const formations: Formation[] = [
  {
    id: 1,
    title: 'Développement Web',
    description: 'Description',
    category: 'Développement Web',
    level: 'intermediaire',
    price: 450000,
    status: 'published',
    instructorId: 2,
    instructor: { id: 2, firstName: 'Fatou', lastName: 'Ndiaye', email: 'fatou@leydymen.com' },
    rating: 4.5,
    ratingCount: 10,
    studentsCount: 4,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T00:00:00Z',
    maxStudents: 50,
    objectives: [],
    requirements: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Data Science',
    description: 'Description',
    category: 'Data Science',
    level: 'avance',
    price: 600000,
    status: 'draft',
    instructorId: 2,
    instructor: { id: 2, firstName: 'Fatou', lastName: 'Ndiaye', email: 'fatou@leydymen.com' },
    rating: 4.0,
    ratingCount: 5,
    studentsCount: 0,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T00:00:00Z',
    maxStudents: 30,
    objectives: [],
    requirements: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

describe('AdminFormationsComponent', () => {
  let formationService: jasmine.SpyObj<FormationService>;

  beforeEach(async () => {
    formationService = jasmine.createSpyObj('FormationService', [
      'getFormations',
      'getFormation',
      'createFormation',
      'updateFormation',
      'deleteFormation',
      'searchFormations',
      'getFormationModules',
    ]);
    formationService.getFormations.and.returnValue(of(formations));
    await TestBed.configureTestingModule({
      imports: [AdminFormationsComponent],
      providers: [
        provideRouter([]),
        { provide: FormationService, useValue: formationService },
      ],
    }).compileComponents();
  });

  it('should render the formations table', () => {
    const fixture = TestBed.createComponent(AdminFormationsComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Développement Web');
    expect(text).toContain('450\u202F000 FCFA');
    expect(text).toContain('4');
    expect(text).toContain('Brouillon');
  });

  it('should update the status of a formation', () => {
    formationService.updateFormation.and.returnValue(of({ ...formations[1], status: 'published' }));
    const fixture = TestBed.createComponent(AdminFormationsComponent);
    fixture.detectChanges();
    const selects = fixture.nativeElement.querySelectorAll('select');
    const statusSelect = Array.from(selects).find(
      (select) => (select as HTMLSelectElement).getAttribute('aria-label') === 'Statut de Data Science',
    ) as HTMLSelectElement;
    statusSelect.value = 'published';
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(formationService.updateFormation).toHaveBeenCalledWith(2, { status: 'published' });
    expect(fixture.nativeElement.textContent).toContain('Statut de « Data Science » mis à jour.');
  });

  it('should delete a formation', () => {
    formationService.deleteFormation.and.returnValue(of(undefined));
    const fixture = TestBed.createComponent(AdminFormationsComponent);
    fixture.detectChanges();
    const rowButtons = fixture.nativeElement.querySelectorAll('tbody button');
    const deleteButtons = Array.from(rowButtons).filter(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Supprimer',
    );
    (deleteButtons[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(formationService.deleteFormation).toHaveBeenCalledWith(2);
    const bodyText = fixture.nativeElement.querySelector('tbody').textContent as string;
    expect(bodyText).not.toContain('Data Science');
  });

  it('should filter by status', () => {
    const fixture = TestBed.createComponent(AdminFormationsComponent);
    fixture.detectChanges();
    const selects = fixture.nativeElement.querySelectorAll('select');
    const filterSelect = selects[0] as HTMLSelectElement;
    filterSelect.value = '1';
    filterSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const bodyText = fixture.nativeElement.querySelector('tbody').textContent as string;
    expect(bodyText).toContain('Développement Web');
    expect(bodyText).not.toContain('Data Science');
  });
});
