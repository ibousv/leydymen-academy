import { TestBed } from '@angular/core/testing';
import { ProgressComponent } from './progress.component';

describe('ProgressComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressComponent],
    }).compileComponents();
  });

  it('should render label and percentage', () => {
    const fixture = TestBed.createComponent(ProgressComponent);
    fixture.componentRef.setInput('percentage', 50);
    fixture.componentRef.setInput('label', 'Progression');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Progression');
    expect(compiled.textContent).toContain('50%');
  });

  it('should clamp the percentage and set the bar width', () => {
    const fixture = TestBed.createComponent(ProgressComponent);
    fixture.componentRef.setInput('percentage', 150);
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('.progress__bar') as HTMLElement;
    expect(bar.style.width).toBe('100%');
  });

  it('should apply the variant class', () => {
    const fixture = TestBed.createComponent(ProgressComponent);
    fixture.componentRef.setInput('percentage', 10);
    fixture.componentRef.setInput('variant', 'warning');
    fixture.detectChanges();
    const progress = fixture.nativeElement.querySelector('.progress') as HTMLElement;
    expect(progress.classList.contains('progress--warning')).toBeTrue();
  });
});
