import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type CardElevation = 1 | 2 | 3 | 4;

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.component.html',
})
export class CardComponent {
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly image = input<string>();
  readonly elevation = input<CardElevation>(1);
  readonly interactive = input(false);

  readonly cardClick = output<void>();

  protected onCardClick(): void {
    if (this.interactive()) {
      this.cardClick.emit();
    }
  }
}
