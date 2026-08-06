import type { UserStatus } from '../models';

/**
 * Convertit les statuts du backend (majuscules) au format frontend (minuscules)
 */
export function normalizeUserStatus(status: string | UserStatus): UserStatus {
  const normalized = status?.toLowerCase();
  switch (normalized) {
    case 'active':
    case 'inactive':
    case 'banned':
      return normalized as UserStatus;
    default:
      return 'active'; // Défaut
  }
}
