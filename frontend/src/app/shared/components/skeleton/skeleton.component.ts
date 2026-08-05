import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton.component.html',
})
export class SkeletonComponent {}
