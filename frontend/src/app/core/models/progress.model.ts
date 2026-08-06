export interface LessonProgress {
  lessonId: number;
  percent: number;
  completed: boolean;
  updatedAt: string;
}

export interface Progress {
  formationId: number;
  enrollmentId: number;
  completionPercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  lessons: LessonProgress[];
}

/**
 * DTO pour la progression des étudiants
 * Utilisé dans les réponses du backend
 */
export interface StudentProgressDTO {
  progressId: number;
  studentId: number;
  lessonId: number;
  enrollmentId: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  percentageWatched: number;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}
