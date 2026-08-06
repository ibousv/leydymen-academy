import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'price',
  standalone: true,
})
export class PricePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) {
      return '';
    }
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} FCFA`;
  }
}
