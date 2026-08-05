import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { LoadingService } from '../core/services/loading.service';

describe('LayoutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the layout shell', () => {
    const fixture = TestBed.createComponent(LayoutComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('app-sidebar')).toBeTruthy();
    expect(compiled.querySelector('app-footer')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should open the sidebar via the header toggle and close it via the overlay', () => {
    const fixture = TestBed.createComponent(LayoutComponent);
    fixture.detectChanges();
    const sidebar = fixture.debugElement.query(By.directive(SidebarComponent)).componentInstance as SidebarComponent;
    expect(sidebar.open()).toBeFalse();

    (fixture.nativeElement.querySelector('.header__menu') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(sidebar.open()).toBeTrue();

    (fixture.nativeElement.querySelector('.sidebar__overlay') as HTMLElement).click();
    fixture.detectChanges();
    expect(sidebar.open()).toBeFalse();
  });

  it('should display the global loading bar while a request is pending', () => {
    const fixture = TestBed.createComponent(LayoutComponent);
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('.layout__loading') as HTMLElement;
    expect(bar).toBeTruthy();
    expect(bar.classList.contains('layout__loading--active')).toBeFalse();

    TestBed.inject(LoadingService).add();
    fixture.detectChanges();
    expect(bar.classList.contains('layout__loading--active')).toBeTrue();

    TestBed.inject(LoadingService).remove();
    fixture.detectChanges();
    expect(bar.classList.contains('layout__loading--active')).toBeFalse();
  });
});
