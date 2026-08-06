import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface SelectOption {
  value: unknown;
  label: string;
}

let nextSelectId = 1;

@Component({
  selector: 'app-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select.component.html',
})
export class SelectComponent {
  readonly label = input.required<string>();
  readonly options = input.required<SelectOption[]>();
  readonly selected = input<unknown>();
  readonly disabled = input(false);

  readonly selectionChange = output<unknown>();

  protected readonly selectId = `app-select-${nextSelectId++}`;

  protected onChange(event: Event): void {
    const index = Number((event.target as HTMLSelectElement).value);
    const option = this.options()[index];
    if (option !== undefined) {
      this.selectionChange.emit(option.value);
    }
  }
}
