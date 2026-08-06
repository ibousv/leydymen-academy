import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render the navigation links', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('.sidebar__link') as NodeListOf<HTMLElement>;
    expect(links.length).toBeGreaterThan(0);
    expect(links[0].textContent?.trim()).toBe('Tableau de bord');
  });

  it('should emit close when a navigation link is clicked', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    let closed = false;
    fixture.componentInstance.close.subscribe(() => (closed = true));
    (fixture.nativeElement.querySelector('.sidebar__link') as HTMLElement).click();
    expect(closed).toBeTrue();
  });

  it('should render the overlay when open', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sidebar__overlay')).toBeTruthy();
  });
});
