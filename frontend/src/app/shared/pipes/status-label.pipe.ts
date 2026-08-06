import { Pipe, type PipeTransform } from '@angular/core';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
  in_progress: 'En cours',
  completed: 'Terminé',
  dropped: 'Abandonné',
  active: 'Actif',
  inactive: 'Inactif',
  banned: 'Banni',
};

@Pipe({
  name: 'statusLabel',
  standalone: true,
})
export class StatusLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return STATUS_LABELS[value] ?? value;
  }
}
