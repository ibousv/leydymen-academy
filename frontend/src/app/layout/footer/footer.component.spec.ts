import { TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();
  });

  it('should render the app name and copyright', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('LEYDYMEN Academy');
    expect(text).toContain('©');
  });
});
