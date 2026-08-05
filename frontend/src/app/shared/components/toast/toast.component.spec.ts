import { TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
    }).compileComponents();
  });

  it('should render the message and call the action handler', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    fixture.componentRef.setInput('message', 'Modifications enregistrées');
    fixture.componentRef.setInput('type', 'success');
    let called = false;
    fixture.componentRef.setInput('action', { label: 'Annuler', handler: () => (called = true) });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.toast__message')?.textContent?.trim()).toBe(
      'Modifications enregistrées',
    );
    (fixture.nativeElement.querySelector('.toast__action') as HTMLButtonElement).click();
    expect(called).toBeTrue();
  });

  it('should hide after the configured duration', () => {
    jasmine.clock().install();
    try {
      const fixture = TestBed.createComponent(ToastComponent);
      fixture.componentRef.setInput('message', 'Information');
      fixture.componentRef.setInput('duration', 1000);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.toast')).toBeTruthy();
      jasmine.clock().tick(1001);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.toast')).toBeNull();
    } finally {
      jasmine.clock().uninstall();
    }
  });
});
