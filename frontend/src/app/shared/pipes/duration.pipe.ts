import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || value < 0) {
      return '';
    }
    const totalMinutes = Math.round(value);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) {
      return `${minutes} min`;
    }
    if (minutes === 0) {
      return `${hours} h`;
    }
    return `${hours} h ${minutes.toString().padStart(2, '0')}`;
  }
}
