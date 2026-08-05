import type { Formation } from './formation.model';
import type { User } from './user.model';

export type EnrollmentStatus = 'in_progress' | 'completed' | 'dropped';

export interface Enrollment {
  id: number;
  formationId: number;
  studentId: number;
  status: EnrollmentStatus;
  enrollmentDate: string;
  completionPercent: number;
  grade?: number | null;
  formation?: Formation;
  student?: User;
}

export interface EnrollmentFilters {
  studentId?: number;
  status?: EnrollmentStatus;
  formationId?: number;
}
