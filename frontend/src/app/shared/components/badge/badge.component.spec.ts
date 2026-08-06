import { TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent],
    }).compileComponents();
  });

  it('should render the label with variant and size classes', () => {
    const fixture = TestBed.createComponent(BadgeComponent);
    fixture.componentRef.setInput('label', 'Actif');
    fixture.componentRef.setInput('variant', 'success');
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge') as HTMLElement;
    expect(badge.textContent?.trim()).toBe('Actif');
    expect(badge.classList.contains('badge-success')).toBeTrue();
    expect(badge.classList.contains('badge-lg')).toBeTrue();
  });
});
