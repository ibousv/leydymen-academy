import type { UserRole } from '../../core/models';

export const ROLES = {
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  STUDENT: 'STUDENT',
} as const satisfies Record<string, UserRole>;

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrateur',
  INSTRUCTOR: 'Formateur',
  STUDENT: 'Étudiant',
};
