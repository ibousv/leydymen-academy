import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  readonly label = input.required<string>();
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('medium');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly icon = input<string>();

  readonly click = output<void>();

  protected readonly classes = computed(
    () => `btn btn-${this.variant()} btn-${this.size() === 'small' ? 'sm' : this.size() === 'medium' ? 'md' : 'lg'}`,
  );

  protected onClick(event: Event): void {
    event.stopPropagation();
    this.click.emit();
  }
}
