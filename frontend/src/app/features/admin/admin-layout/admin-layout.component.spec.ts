import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';

describe('AdminLayoutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLayoutComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render the admin sub-navigation', () => {
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Tableau de bord');
    expect(text).toContain('Utilisateurs');
    expect(text).toContain('Formations');
    expect(text).toContain('Statistiques');
  });
});
