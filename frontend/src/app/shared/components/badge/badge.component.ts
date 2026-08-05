import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral';
export type BadgeSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.component.html',
})
export class BadgeComponent {
  readonly label = input.required<string>();
  readonly variant = input<BadgeVariant>('neutral');
  readonly size = input<BadgeSize>('medium');

  protected readonly classes = computed(() => {
    const sizeClass = this.size() === 'small' ? 'badge-sm' : this.size() === 'medium' ? 'badge-md' : 'badge-lg';
    return `badge badge-${this.variant()} ${sizeClass}`;
  });
}
