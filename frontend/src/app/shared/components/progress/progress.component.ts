import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ProgressVariant = 'primary' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress.component.html',
})
export class ProgressComponent {
  readonly percentage = input.required<number>();
  readonly label = input<string>();
  readonly variant = input<ProgressVariant>('primary');

  protected readonly clampedPercentage = computed(() => Math.min(100, Math.max(0, this.percentage())));

  protected readonly classes = computed(() => {
    const variant = this.variant();
    return variant === 'primary' ? 'progress' : `progress progress--${variant}`;
  });
}
