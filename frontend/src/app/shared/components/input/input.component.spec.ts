import { TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents();
  });

  it('should create and render the label', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.componentRef.setInput('label', 'Email');
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.form-field__label') as HTMLElement;
    expect(label.textContent?.trim()).toBe('Email');
  });

  it('should emit valueChange on input', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.componentRef.setInput('label', 'Email');
    fixture.detectChanges();
    let value: string | undefined;
    fixture.componentInstance.valueChange.subscribe((v) => (value = v));
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'awa@example.com';
    input.dispatchEvent(new Event('input'));
    expect(value).toBe('awa@example.com');
  });

  it('should display an error message when provided', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.componentRef.setInput('label', 'Email');
    fixture.componentRef.setInput('error', 'Adresse invalide');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Adresse invalide');
  });
});
