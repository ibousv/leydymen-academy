import { TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();
  });

  it('should render title and content', () => {
    const fixture = TestBed.createComponent(ModalComponent);
    fixture.componentRef.setInput('title', 'Supprimer la formation');
    fixture.componentRef.setInput('content', 'Cette action est irréversible.');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.modal__title')?.textContent?.trim()).toBe('Supprimer la formation');
    expect(compiled.querySelector('.modal__body')?.textContent).toContain('Cette action est irréversible.');
  });

  it('should call action handler on footer button click', () => {
    const fixture = TestBed.createComponent(ModalComponent);
    fixture.componentRef.setInput('title', 'Supprimer');
    let called = false;
    fixture.componentRef.setInput('actions', [{ label: 'Confirmer', handler: () => (called = true) }]);
    fixture.detectChanges();
    const actionButton = fixture.nativeElement.querySelector('.modal__footer button') as HTMLButtonElement;
    actionButton.click();
    expect(called).toBeTrue();
  });

  it('should emit close on close button click', () => {
    const fixture = TestBed.createComponent(ModalComponent);
    fixture.componentRef.setInput('title', 'Supprimer');
    fixture.detectChanges();
    let closed = false;
    fixture.componentInstance.close.subscribe(() => (closed = true));
    (fixture.nativeElement.querySelector('.modal__close') as HTMLButtonElement).click();
    expect(closed).toBeTrue();
  });

  it('should emit close when clicking the overlay', () => {
    const fixture = TestBed.createComponent(ModalComponent);
    fixture.componentRef.setInput('title', 'Supprimer');
    fixture.detectChanges();
    let closed = false;
    fixture.componentInstance.close.subscribe(() => (closed = true));
    (fixture.nativeElement.querySelector('.modal-overlay') as HTMLElement).click();
    expect(closed).toBeTrue();
  });
});
