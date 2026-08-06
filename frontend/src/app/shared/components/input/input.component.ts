import { ChangeDetectionStrategy, Component, forwardRef, input, model, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'date';

let nextInputId = 1;

@Component({
  selector: 'app-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  templateUrl: './input.component.html',
})
export class InputComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly placeholder = input<string>();
  readonly type = input<InputType>('text');
  readonly value = model('');
  readonly disabled = input(false);
  readonly error = input<string>();
  readonly required = input(false);

  readonly valueChange = output<string>();

  protected readonly inputId = `app-input-${nextInputId++}`;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.valueChange.emit(value);
    this.onChange(value);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
