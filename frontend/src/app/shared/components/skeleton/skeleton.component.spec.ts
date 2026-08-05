import { TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonComponent],
    }).compileComponents();
  });

  it('should render the skeleton placeholder', () => {
    const fixture = TestBed.createComponent(SkeletonComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.skeleton')).toBeTruthy();
  });
});
