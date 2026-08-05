import type { User } from './user.model';

export interface ActivityItem {
  id: number;
  type: string;
  message: string;
  date: string;
}

export interface FormationEnrollmentCount {
  formationId: number;
  title: string;
  enrollments: number;
}

export interface FormationRevenue {
  formationId: number;
  title: string;
  revenue: number;
}

export interface MonthCount {
  month: string;
  count: number;
}

export interface MonthRevenue {
  month: string;
  revenue: number;
}

export interface LevelCount {
  level: string;
  count: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
  totalFormations: number;
  totalEnrollments: number;
  totalRevenue: number;
  activeEnrollments: number;
  completedEnrollments: number;
  recentActivity: ActivityItem[];
  topFormations: FormationEnrollmentCount[];
  recentUsers: User[];
  enrollmentsOverTime: MonthCount[];
  studentDistribution: LevelCount[];
  revenueByFormation: FormationRevenue[];
}

export interface FormationStats {
  formationId: number;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageProgress: number;
  averageGrade: number | null;
  lessonsCount: number;
  modulesCount: number;
  enrollmentsOverTime: MonthCount[];
}

export interface UserStats {
  userId: number;
  totalEnrollments: number;
  completedCourses: number;
  inProgressCourses: number;
  droppedCourses: number;
  averageCompletion: number;
  recentActivity: ActivityItem[];
  lessonProgress: LessonProgressSummary[];
}

export interface LessonProgressSummary {
  lessonId: number;
  title: string;
  percent: number;
  completed: boolean;
}

export interface RevenueStats {
  totalRevenue: number;
  averageOrderValue: number;
  revenueByFormation: FormationRevenue[];
  revenueTrend: MonthRevenue[];
  paidEnrollments: number;
}
