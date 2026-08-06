import { TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();
  });

  it('should create and render title and subtitle', () => {
    const fixture = TestBed.createComponent(CardComponent);
    fixture.componentRef.setInput('title', 'Formation Angular');
    fixture.componentRef.setInput('subtitle', 'Niveau avancé');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Formation Angular');
    expect(compiled.textContent).toContain('Niveau avancé');
  });

  it('should emit cardClick only when interactive', () => {
    const fixture = TestBed.createComponent(CardComponent);
    fixture.detectChanges();
    let clicked = false;
    fixture.componentInstance.cardClick.subscribe(() => (clicked = true));

    (fixture.nativeElement.querySelector('.card') as HTMLElement).click();
    expect(clicked).toBeFalse();

    fixture.componentRef.setInput('interactive', true);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.card') as HTMLElement).click();
    expect(clicked).toBeTrue();
  });
});
