import type { UserRole } from '../../core/models';
import { ROLES } from './roles.constants';
import { ROUTES } from './routes.constants';

export interface NavItem {
  route: string;
  label: string;
  roles?: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { route: ROUTES.dashboard, label: 'Tableau de bord' },
  { route: ROUTES.formations, label: 'Formations' },
  { route: ROUTES.students, label: 'Étudiants', roles: [ROLES.ADMIN, ROLES.INSTRUCTOR] },
  { route: ROUTES.enrollments, label: 'Inscriptions' },
  { route: ROUTES.myCourses, label: 'Mes cours', roles: [ROLES.STUDENT] },
  { route: ROUTES.profile, label: 'Profil' },
  { route: ROUTES.admin, label: 'Administration', roles: [ROLES.ADMIN] },
];
