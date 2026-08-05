import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  handler: () => void;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  readonly message = input.required<string>();
  readonly type = input<ToastType>('info');
  readonly duration = input<number>();
  readonly action = input<ToastAction>();

  protected readonly visible = signal(true);

  constructor() {
    effect(() => {
      const duration = this.duration();
      if (duration && duration > 0) {
        const timeoutId = setTimeout(() => this.visible.set(false), duration);
        return () => clearTimeout(timeoutId);
      }
      return undefined;
    });
  }

  protected onAction(): void {
    this.action()?.handler();
  }
}
