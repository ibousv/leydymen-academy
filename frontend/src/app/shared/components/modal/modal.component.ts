import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

export interface ModalAction {
  label: string;
  handler: () => void;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  readonly title = input.required<string>();
  readonly content = input<string>();
  readonly actions = input<ModalAction[]>([]);
  readonly closeButton = input(true);

  readonly close = output<void>();

  protected onClose(): void {
    this.close.emit();
  }

  protected onAction(action: ModalAction): void {
    action.handler();
  }

  protected onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
