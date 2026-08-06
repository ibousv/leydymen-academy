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
