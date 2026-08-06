import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render the app name', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('LEYDYMEN Academy');
  });

  it('should emit toggleSidebar on menu button click', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    let toggled = false;
    fixture.componentInstance.toggleSidebar.subscribe(() => (toggled = true));
    (fixture.nativeElement.querySelector('.header__menu') as HTMLButtonElement).click();
    expect(toggled).toBeTrue();
  });
});
