import { Pipe, type PipeTransform } from '@angular/core';
import type { FormationLevel } from '../../core/models';

const LEVEL_LABELS: Record<FormationLevel, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

@Pipe({
  name: 'levelLabel',
  standalone: true,
})
export class LevelLabelPipe implements PipeTransform {
  transform(value: FormationLevel | null | undefined): string {
    if (!value) {
      return '';
    }
    return LEVEL_LABELS[value] ?? value;
  }
}
