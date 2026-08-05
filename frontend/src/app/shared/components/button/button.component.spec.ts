import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `<app-button label="Tester" (click)="count.set(count() + 1)" />`,
})
class ButtonHostComponent {
  readonly count = signal(0);
}

describe('ButtonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();
  });

  it('should create and render the label', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('label', "S'inscrire");
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.textContent?.trim()).toBe("S'inscrire");
  });

  it('should apply variant and size classes', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('label', 'OK');
    fixture.componentRef.setInput('variant', 'danger');
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.classList.contains('btn-danger')).toBeTrue();
    expect(button.classList.contains('btn-lg')).toBeTrue();
  });

  it('should disable while loading', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('label', 'OK');
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBeTrue();
    expect(button.classList.contains('btn-loading')).toBeTrue();
  });

  it('should emit click', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('label', 'OK');
    fixture.detectChanges();
    let clicked = false;
    fixture.componentInstance.click.subscribe(() => (clicked = true));
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(clicked).toBeTrue();
  });

  it('should fire a host (click) binding exactly once per native click', () => {
    const fixture = TestBed.createComponent(ButtonHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(fixture.componentInstance.count()).toBe(1);
  });
});
