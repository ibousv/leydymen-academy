import { TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';

describe('TableComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent],
    }).compileComponents();
  });

  it('should render column headers and row cells', () => {
    const fixture = TestBed.createComponent(TableComponent);
    fixture.componentRef.setInput('columns', [{ key: 'name', header: 'Nom', sortable: true }]);
    fixture.componentRef.setInput('data', [{ name: 'Awa' }]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('th')?.textContent?.trim()).toContain('Nom');
    expect(compiled.querySelector('tbody td')?.textContent?.trim()).toBe('Awa');
  });

  it('should emit rowClick with the row data', () => {
    const fixture = TestBed.createComponent(TableComponent);
    fixture.componentRef.setInput('columns', [{ key: 'name', header: 'Nom' }]);
    fixture.componentRef.setInput('data', [{ name: 'Awa' }]);
    fixture.detectChanges();
    let clicked: unknown;
    fixture.componentInstance.rowClick.subscribe((r) => (clicked = r));
    (fixture.nativeElement.querySelector('tbody tr') as HTMLTableRowElement).click();
    expect(clicked).toEqual({ name: 'Awa' });
  });

  it('should emit pageChange on next page', () => {
    const fixture = TestBed.createComponent(TableComponent);
    fixture.componentRef.setInput('columns', [{ key: 'id', header: 'ID' }]);
    fixture.componentRef.setInput('data', [{ id: 1 }]);
    fixture.componentRef.setInput('pageable', true);
    fixture.componentRef.setInput('page', 1);
    fixture.componentRef.setInput('pageSize', 1);
    fixture.componentRef.setInput('total', 3);
    fixture.detectChanges();
    let page: number | undefined;
    fixture.componentInstance.pageChange.subscribe((p) => (page = p));
    const buttons = fixture.nativeElement.querySelectorAll('.pagination__btn') as NodeListOf<HTMLButtonElement>;
    buttons[1].click();
    expect(page).toBe(2);
  });
});
