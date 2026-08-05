import { TestBed } from '@angular/core/testing';
import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent],
    }).compileComponents();
  });

  it('should render options and emit selectionChange with the selected value', () => {
    const fixture = TestBed.createComponent(SelectComponent);
    fixture.componentRef.setInput('label', 'Rôle');
    fixture.componentRef.setInput('options', [
      { value: 'student', label: 'Étudiant' },
      { value: 'instructor', label: 'Instructeur' },
    ]);
    fixture.detectChanges();
    let selected: unknown;
    fixture.componentInstance.selectionChange.subscribe((v) => (selected = v));
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.options.length).toBe(2);
    select.value = '1';
    select.dispatchEvent(new Event('change'));
    expect(selected).toBe('instructor');
  });
});
