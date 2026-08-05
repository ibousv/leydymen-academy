import type { EnrollmentStatus } from '../../core/models';
import type { FormationLevel, FormationSort, FormationStatus } from '../../core/models';

export const FORMATION_CATEGORIES = [
  'Développement Web',
  'Data Science',
  'DevOps',
  'Cybersécurité',
  'Mobile',
  'Cloud',
] as const;

export const FORMATION_LEVELS: { value: FormationLevel; label: string }[] = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
];

export const FORMATION_STATUS: { value: FormationStatus; label: string }[] = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publié' },
  { value: 'archived', label: 'Archivé' },
];

export const FORMATION_SORTS: { value: FormationSort; label: string }[] = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'newest', label: 'Plus récentes' },
  { value: 'price', label: 'Prix' },
  { value: 'rating', label: 'Meilleures notes' },
];

export const ENROLLMENT_STATUS: { value: EnrollmentStatus; label: string }[] = [
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'dropped', label: 'Abandonné' },
];
