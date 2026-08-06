// LEYDYMEN Academy — couche de données mock (serveur uniquement, jamais bundlé côté client)

export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
export type UserStatus = 'active' | 'inactive' | 'banned';
export type FormationLevel = 'debutant' | 'intermediaire' | 'avance';
export type FormationStatus = 'draft' | 'published' | 'archived';
export type LessonStatus = 'draft' | 'published';
export type EnrollmentStatus = 'in_progress' | 'completed' | 'dropped';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: string;
  lastActive: string;
}

export interface InstructorSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Formation {
  id: number;
  title: string;
  description: string;
  category: string;
  level: FormationLevel;
  price: number;
  status: FormationStatus;
  instructorId: number;
  instructor: InstructorSummary;
  image?: string;
  rating: number;
  ratingCount: number;
  studentsCount: number;
  startDate: string;
  endDate: string;
  maxStudents: number;
  objectives: string[];
  requirements: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonResource {
  id: number;
  title: string;
  url: string;
}

export interface Lesson {
  id: number;
  moduleId: number;
  title: string;
  description?: string;
  durationMinutes: number;
  videoUrl?: string;
  order: number;
  status: LessonStatus;
  resources?: LessonResource[];
}

export interface FormationModule {
  id: number;
  formationId: number;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Enrollment {
  id: number;
  formationId: number;
  studentId: number;
  status: EnrollmentStatus;
  enrollmentDate: string;
  completionPercent: number;
  grade?: number | null;
}

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
  recentUsers: Omit<User, 'password'>[];
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

export interface LessonProgressSummary {
  lessonId: number;
  title: string;
  percent: number;
  completed: boolean;
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

export interface RevenueStats {
  totalRevenue: number;
  averageOrderValue: number;
  revenueByFormation: FormationRevenue[];
  revenueTrend: MonthRevenue[];
  paidEnrollments: number;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ------------------------------------------------------------
// Stores en mémoire
// ------------------------------------------------------------

export const users: User[] = [];
export const formations: Formation[] = [];
export const modules: FormationModule[] = [];
export const lessons: Lesson[] = [];
export const enrollments: Enrollment[] = [];

const lessonProgressByStudent = new Map<number, Map<number, LessonProgress>>();
const ratings = new Map<number, { sum: number; count: number }>();

let nextId = 1;

function nextIdValue(): number {
  return nextId++;
}

// ------------------------------------------------------------
// Helpers de construction
// ------------------------------------------------------------

function makeUser(data: Omit<User, 'id'>): User {
  const user: User = { id: nextIdValue(), ...data };
  users.push(user);
  return user;
}

function makeFormation(
  data: Omit<Formation, 'id' | 'instructor' | 'rating' | 'ratingCount' | 'studentsCount' | 'createdAt' | 'updatedAt'>,
  createdAt: string,
): Formation {
  const instructor = users.find((u) => u.id === data.instructorId);
  const formation: Formation = {
    id: nextIdValue(),
    ...data,
    instructor: {
      id: data.instructorId,
      firstName: instructor?.firstName ?? '',
      lastName: instructor?.lastName ?? '',
      email: instructor?.email ?? '',
    },
    rating: 0,
    ratingCount: 0,
    studentsCount: 0,
    createdAt,
    updatedAt: createdAt,
  };
  formations.push(formation);
  return formation;
}

function makeModule(formationId: number, title: string, description: string | undefined): FormationModule {
  const module: FormationModule = {
    id: nextIdValue(),
    formationId,
    title,
    description,
    order: modules.filter((m) => m.formationId === formationId).length + 1,
    lessons: [],
  };
  modules.push(module);
  return module;
}

function makeLesson(
  module: FormationModule,
  title: string,
  durationMinutes: number,
  opts: { description?: string; videoUrl?: string } = {},
): Lesson {
  const lesson: Lesson = {
    id: nextIdValue(),
    moduleId: module.id,
    title,
    durationMinutes,
    order: module.lessons.length + 1,
    status: 'published',
    ...opts,
  };
  module.lessons.push(lesson);
  lessons.push(lesson);
  return lesson;
}

function makeEnrollment(
  studentId: number,
  formationId: number,
  status: EnrollmentStatus,
  enrollmentDate: string,
  grade?: number | null,
): Enrollment {
  const enrollment: Enrollment = {
    id: nextIdValue(),
    formationId,
    studentId,
    status,
    enrollmentDate,
    completionPercent: 0,
    grade: grade ?? null,
  };
  enrollments.push(enrollment);
  return enrollment;
}

function setProgress(
  studentId: number,
  formationId: number,
  doneIndexes: number[],
  partials: Array<[index: number, percent: number]>,
  updatedAt: string,
): void {
  const map = lessonProgressByStudent.get(studentId) ?? new Map<number, LessonProgress>();
  lessonProgressByStudent.set(studentId, map);
  const formationLessons = publishedLessons(formationId);
  formationLessons.forEach((lesson, index) => {
    if (doneIndexes.includes(index)) {
      map.set(lesson.id, { lessonId: lesson.id, percent: 100, completed: true, updatedAt });
      return;
    }
    const partial = partials.find(([i]) => i === index);
    if (partial) {
      map.set(lesson.id, { lessonId: lesson.id, percent: partial[1], completed: false, updatedAt });
    }
  });
}

// ------------------------------------------------------------
// Accès et calculs
// ------------------------------------------------------------

export function toPublicUser(user: User): Omit<User, 'password'> {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

export function getUserById(id: number): User | undefined {
  return users.find((u) => u.id === id);
}

export function findUserByLogin(username: string): User | undefined {
  return users.find((u) => u.username === username || u.email === username);
}

export function login(user: User): LoginResponse {
  return {
    token: `mock-token-${user.id}`,
    refreshToken: `mock-refresh-${user.id}`,
    user: toPublicUser(user),
  };
}

export function register(data: { firstName: string; lastName: string; email: string; username: string; password: string }): User {
  const now = new Date().toISOString();
  return makeUser({
    ...data,
    role: 'STUDENT',
    status: 'active',
    createdAt: now,
    lastActive: now,
  });
}

export function publishedLessons(formationId: number): Lesson[] {
  return modules
    .filter((m) => m.formationId === formationId)
    .sort((a, b) => a.order - b.order)
    .flatMap((m) => m.lessons.filter((l) => l.status === 'published'));
}

export function formationModules(formationId: number): FormationModule[] {
  return modules
    .filter((m) => m.formationId === formationId)
    .sort((a, b) => a.order - b.order)
    .map((m) => ({ ...m, lessons: [...m.lessons].sort((a, b) => a.order - b.order) }));
}

export function getModule(id: number): FormationModule | undefined {
  return modules.find((m) => m.id === id);
}

export function createModule(formationId: number, data: { title: string; description?: string }): FormationModule {
  const module: FormationModule = {
    id: nextIdValue(),
    formationId,
    title: data.title,
    description: data.description,
    order: modules.filter((m) => m.formationId === formationId).length + 1,
    lessons: [],
  };
  modules.push(module);
  return module;
}

export function updateModule(id: number, data: { title?: string; description?: string }): FormationModule | undefined {
  const module = getModule(id);
  if (!module) {
    return undefined;
  }
  if (data.title !== undefined) {
    module.title = data.title;
  }
  if (data.description !== undefined) {
    module.description = data.description;
  }
  return module;
}

export function deleteModule(id: number): boolean {
  const index = modules.findIndex((m) => m.id === id);
  if (index === -1) {
    return false;
  }
  const removed = modules.splice(index, 1)[0];
  for (const lesson of removed.lessons) {
    const lessonIndex = lessons.findIndex((l) => l.id === lesson.id);
    if (lessonIndex !== -1) {
      lessons.splice(lessonIndex, 1);
    }
  }
  return true;
}

export function getLesson(id: number): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export function createLesson(
  moduleId: number,
  data: { title: string; description?: string; durationMinutes: number; videoUrl?: string; status: LessonStatus },
): Lesson | undefined {
  const module = getModule(moduleId);
  if (!module) {
    return undefined;
  }
  const lesson: Lesson = {
    id: nextIdValue(),
    moduleId,
    title: data.title,
    description: data.description,
    durationMinutes: data.durationMinutes,
    videoUrl: data.videoUrl,
    order: module.lessons.length + 1,
    status: data.status,
  };
  module.lessons.push(lesson);
  lessons.push(lesson);
  return lesson;
}

export function updateLesson(id: number, data: Partial<Lesson>): Lesson | undefined {
  const lesson = getLesson(id);
  if (!lesson) {
    return undefined;
  }
  const allowed: (keyof Lesson)[] = ['title', 'description', 'durationMinutes', 'videoUrl', 'status'];
  for (const key of allowed) {
    const value = data[key];
    if (value !== undefined) {
      lesson[key] = value as never;
    }
  }
  return lesson;
}

export function deleteLesson(id: number): boolean {
  const lesson = getLesson(id);
  if (!lesson) {
    return false;
  }
  const module = getModule(lesson.moduleId);
  if (module) {
    const lessonIndex = module.lessons.findIndex((l) => l.id === id);
    if (lessonIndex !== -1) {
      module.lessons.splice(lessonIndex, 1);
    }
  }
  const globalIndex = lessons.findIndex((l) => l.id === id);
  if (globalIndex !== -1) {
    lessons.splice(globalIndex, 1);
  }
  return true;
}

export function getFormation(id: number): Formation | undefined {
  return formations.find((f) => f.id === id);
}

export function createFormation(
  data: Partial<Formation> & { title: string; description: string; category: string; level: FormationLevel; price: number },
  instructor: User,
): Formation {
  const now = new Date().toISOString();
  const formation: Formation = {
    id: nextIdValue(),
    title: data.title,
    description: data.description,
    category: data.category,
    level: data.level,
    price: data.price,
    status: data.status ?? 'draft',
    instructorId: instructor.id,
    instructor: {
      id: instructor.id,
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      email: instructor.email,
    },
    image: data.image,
    rating: 0,
    ratingCount: 0,
    studentsCount: 0,
    startDate: data.startDate ?? '',
    endDate: data.endDate ?? '',
    maxStudents: data.maxStudents ?? 0,
    objectives: data.objectives ?? [],
    requirements: data.requirements ?? [],
    createdAt: now,
    updatedAt: now,
  };
  formations.push(formation);
  return formation;
}

export function updateFormation(formation: Formation, data: Partial<Formation>): Formation {
  const allowed: (keyof Formation)[] = [
    'title',
    'description',
    'category',
    'level',
    'price',
    'status',
    'image',
    'startDate',
    'endDate',
    'maxStudents',
    'objectives',
    'requirements',
  ];
  for (const key of allowed) {
    const value = (data as Record<string, unknown>)[key];
    if (value !== undefined) {
      (formation as unknown as Record<string, unknown>)[key] = value;
    }
  }
  formation.updatedAt = new Date().toISOString();
  return formation;
}

export function enrollmentsForStudent(studentId: number): Enrollment[] {
  return enrollments.filter((e) => e.studentId === studentId);
}

export function findEnrollment(studentId: number, formationId: number): Enrollment | undefined {
  return enrollments.find((e) => e.studentId === studentId && e.formationId === formationId);
}

export function nextEnrollmentId(): number {
  return nextIdValue();
}

export function getLessonProgressForStudent(studentId: number): Map<number, LessonProgress> {
  return lessonProgressByStudent.get(studentId) ?? new Map<number, LessonProgress>();
}

export function computeProgress(studentId: number, formationId: number): Progress {
  const enrollment = findEnrollment(studentId, formationId);
  const all = publishedLessons(formationId);
  const progressMap = getLessonProgressForStudent(studentId);
  const lessonProgress = all.map((l) => progressMap.get(l.id) ?? { lessonId: l.id, percent: 0, completed: false, updatedAt: '' });
  const completed = lessonProgress.filter((l) => l.completed || l.percent >= 100).length;
  const total = all.length;
  const percent = total === 0 ? 0 : Math.round((lessonProgress.reduce((acc, l) => acc + l.percent, 0) / (total * 100)) * 100);
  return {
    formationId,
    enrollmentId: enrollment?.id ?? 0,
    completionPercent: percent,
    completedLessonsCount: completed,
    totalLessonsCount: total,
    lessons: lessonProgress,
  };
}

export function setLessonProgress(studentId: number, formationId: number): void;
export function setLessonProgress(studentId: number, moduleId: number, lessonId: number, percent: number): LessonProgress;
export function setLessonProgress(
  studentId: number,
  formationIdOrModuleId: number,
  lessonId?: number,
  percent?: number,
): void | LessonProgress {
  const map = lessonProgressByStudent.get(studentId) ?? new Map<number, LessonProgress>();
  lessonProgressByStudent.set(studentId, map);
  const updatedAt = new Date().toISOString();
  if (lessonId === undefined || percent === undefined) {
    const formationLessons = publishedLessons(formationIdOrModuleId);
    formationLessons.forEach((lesson) =>
      map.set(lesson.id, { lessonId: lesson.id, percent: 100, completed: true, updatedAt }),
    );
    return;
  }
  const progress: LessonProgress = { lessonId, percent, completed: percent >= 100, updatedAt };
  map.set(lessonId, progress);
  return progress;
}

export function enrichFormation(formation: Formation): Formation {
  const activeCount = enrollments.filter((e) => e.formationId === formation.id && e.status !== 'dropped').length;
  const rating = ratings.get(formation.id);
  return {
    ...formation,
    studentsCount: activeCount,
    rating: rating && rating.count > 0 ? Math.round((rating.sum / rating.count) * 10) / 10 : 0,
    ratingCount: rating?.count ?? 0,
  };
}

export function enrichEnrollment(enrollment: Enrollment): Enrollment & {
  formation?: Formation;
  student?: Omit<User, 'password'>;
} {
  const progress = computeProgress(enrollment.studentId, enrollment.formationId);
  const formation = getFormation(enrollment.formationId);
  const student = getUserById(enrollment.studentId);
  return {
    ...enrollment,
    completionPercent: progress.completionPercent,
    formation: formation ? enrichFormation(formation) : undefined,
    student: student ? toPublicUser(student) : undefined,
  };
}

export function countEnrollmentsByFormation(formationId: number): number {
  return enrollments.filter((e) => e.formationId === formationId).length;
}

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function sumNonDroppedRevenue(): number {
  return enrollments
    .filter((e) => e.status !== 'dropped')
    .reduce((acc, e) => acc + (getFormation(e.formationId)?.price ?? 0), 0);
}

function recentEnrollments(limit: number): ActivityItem[] {
  return [...enrollments]
    .sort((a, b) => b.enrollmentDate.localeCompare(a.enrollmentDate))
    .slice(0, limit)
    .map((e) => ({
      id: e.id,
      type: 'enrollment',
      message: `${getUserById(e.studentId)?.firstName ?? ''} ${getUserById(e.studentId)?.lastName ?? ''} s'est inscrit à « ${getFormation(e.formationId)?.title ?? ''} »`,
      date: e.enrollmentDate,
    }));
}

// ------------------------------------------------------------
// Statistiques
// ------------------------------------------------------------

export function buildDashboardStats(): DashboardStats {
  const published = formations.filter((f) => f.status === 'published');
  return {
    totalUsers: users.length,
    totalStudents: users.filter((u) => u.role === 'STUDENT').length,
    totalInstructors: users.filter((u) => u.role === 'INSTRUCTOR').length,
    totalAdmins: users.filter((u) => u.role === 'ADMIN').length,
    totalFormations: formations.length,
    totalEnrollments: enrollments.length,
    totalRevenue: sumNonDroppedRevenue(),
    activeEnrollments: enrollments.filter((e) => e.status === 'in_progress').length,
    completedEnrollments: enrollments.filter((e) => e.status === 'completed').length,
    recentActivity: recentEnrollments(6),
    topFormations: [...new Map(enrollments.map((e) => e.formationId).map((fid) => [fid, fid]))]
      .map(([fid]) => fid)
      .map((fid) => ({ formationId: fid, title: getFormation(fid)?.title ?? '', enrollments: countEnrollmentsByFormation(fid) }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5),
    recentUsers: [...users]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)
      .map(toPublicUser),
    enrollmentsOverTime: [...new Set(enrollments.map((e) => monthKey(e.enrollmentDate)))]
      .sort()
      .map((m) => ({ month: m, count: enrollments.filter((e) => monthKey(e.enrollmentDate) === m).length })),
    studentDistribution: published.map((f) => ({
      level: f.level,
      count: enrollments.filter((e) => e.formationId === f.id).length,
    })),
    revenueByFormation: published
      .map((f) => ({
        formationId: f.id,
        title: f.title,
        revenue: enrollments.filter((e) => e.formationId === f.id && e.status !== 'dropped').length * f.price,
      }))
      .filter((r) => r.revenue > 0),
  };
}

export function buildFormationStats(formationId: number): FormationStats | null {
  const formation = getFormation(formationId);
  if (!formation) {
    return null;
  }
  const enrollmentsFor = enrollments.filter((e) => e.formationId === formationId);
  const completed = enrollmentsFor.filter((e) => e.status === 'completed');
  const grades = completed.map((e) => e.grade).filter((g): g is number => g != null);
  const allLessons = publishedLessons(formationId);
  return {
    formationId,
    totalEnrollments: enrollmentsFor.length,
    completedEnrollments: completed.length,
    completionRate: enrollmentsFor.length === 0 ? 0 : Math.round((completed.length / enrollmentsFor.length) * 100),
    averageProgress:
      enrollmentsFor.length === 0
        ? 0
        : Math.round(enrollmentsFor.reduce((acc, e) => acc + e.completionPercent, 0) / enrollmentsFor.length),
    averageGrade: grades.length === 0 ? null : Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10,
    lessonsCount: allLessons.length,
    modulesCount: modules.filter((m) => m.formationId === formationId).length,
    enrollmentsOverTime: [...new Set(enrollmentsFor.map((e) => monthKey(e.enrollmentDate)))]
      .sort()
      .map((m) => ({ month: m, count: enrollmentsFor.filter((e) => monthKey(e.enrollmentDate) === m).length })),
  };
}

export function buildUserStats(userId: number): UserStats | null {
  const student = getUserById(userId);
  if (!student) {
    return null;
  }
  const userEnrollments = enrollmentsForStudent(userId);
  const progressMap = getLessonProgressForStudent(userId);
  const withFormation = userEnrollments
    .map((e) => ({ enrollment: e, formation: getFormation(e.formationId) }))
    .filter((x) => x.formation != null);
  const allLessonSummaries = withFormation.flatMap(({ formation, enrollment }) =>
    publishedLessons(formation!.id).map((l) => ({
      lessonId: l.id,
      title: l.title,
      percent: progressMap.get(l.id)?.percent ?? 0,
      completed: progressMap.get(l.id)?.completed ?? false,
      lesson: l,
    })),
  );
  return {
    userId,
    totalEnrollments: userEnrollments.length,
    completedCourses: userEnrollments.filter((e) => e.status === 'completed').length,
    inProgressCourses: userEnrollments.filter((e) => e.status === 'in_progress').length,
    droppedCourses: userEnrollments.filter((e) => e.status === 'dropped').length,
    averageCompletion:
      userEnrollments.length === 0
        ? 0
        : Math.round(userEnrollments.reduce((acc, e) => acc + e.completionPercent, 0) / userEnrollments.length),
    recentActivity: recentEnrollments(5).filter((a) => a.id === userId),
    lessonProgress: allLessonSummaries.map(({ lessonId, title, percent, completed }) => ({
      lessonId,
      title,
      percent,
      completed,
    })),
  };
}

export function buildRevenueStats(): RevenueStats {
  const paid = enrollments.filter((e) => e.status !== 'dropped');
  const totalRevenue = sumNonDroppedRevenue();
  const months = [...new Set(paid.map((e) => monthKey(e.enrollmentDate)))].sort();
  return {
    totalRevenue,
    averageOrderValue: paid.length === 0 ? 0 : Math.round(totalRevenue / paid.length),
    revenueByFormation: [...new Set(paid.map((e) => e.formationId))]
      .map((fid) => ({
        formationId: fid,
        title: getFormation(fid)?.title ?? '',
        revenue: paid.filter((e) => e.formationId === fid).length * (getFormation(fid)?.price ?? 0),
      }))
      .filter((r) => r.revenue > 0),
    revenueTrend: months.map((m) => ({
      month: m,
      revenue: paid.filter((e) => monthKey(e.enrollmentDate) === m).reduce((acc, e) => acc + (getFormation(e.formationId)?.price ?? 0), 0),
    })),
    paidEnrollments: paid.length,
  };
}

// ------------------------------------------------------------
// Seed data
// ------------------------------------------------------------

makeUser({
  firstName: 'Amadou',
  lastName: 'Ndiaye',
  email: 'admin@leydymen.sn',
  username: 'admin',
  password: 'admin123',
  role: 'ADMIN',
  status: 'active',
  bio: 'Directeur de LEYDYMEN Academy.',
  location: 'Dakar, Sénégal',
  website: 'https://leydymen.sn',
  createdAt: '2025-01-10T09:00:00.000Z',
  lastActive: '2026-07-28T08:15:00.000Z',
});

makeUser({
  firstName: 'Mamadou',
  lastName: 'Diallo',
  email: 'instructor@leydymen.sn',
  username: 'instructor',
  password: 'instructor123',
  role: 'INSTRUCTOR',
  status: 'active',
  bio: 'Formateur senior en développement web et cloud.',
  location: 'Dakar, Sénégal',
  website: 'https://leydymen.sn/instructeurs/mamadou-diallo',
  createdAt: '2025-02-01T10:30:00.000Z',
  lastActive: '2026-07-27T14:20:00.000Z',
});

makeUser({
  firstName: 'Aïssatou',
  lastName: 'Sow',
  email: 'student1@leydymen.sn',
  username: 'student1',
  password: 'student123',
  role: 'STUDENT',
  status: 'active',
  bio: 'Étudiante en développement web.',
  location: 'Thiès, Sénégal',
  createdAt: '2025-09-12T11:00:00.000Z',
  lastActive: '2026-07-25T18:05:00.000Z',
});

makeUser({
  firstName: 'Ousmane',
  lastName: 'Diop',
  email: 'student2@leydymen.sn',
  username: 'student2',
  password: 'student123',
  role: 'STUDENT',
  status: 'active',
  bio: 'Étudiant en cybersécurité.',
  location: 'Dakar, Sénégal',
  createdAt: '2025-10-05T09:45:00.000Z',
  lastActive: '2026-07-22T16:40:00.000Z',
});

makeUser({
  firstName: 'Fatou',
  lastName: 'Ba',
  email: 'student3@leydymen.sn',
  username: 'student3',
  password: 'student123',
  role: 'STUDENT',
  status: 'active',
  bio: 'Étudiante en data science.',
  location: 'Saint-Louis, Sénégal',
  createdAt: '2025-11-18T14:30:00.000Z',
  lastActive: '2026-07-20T10:10:00.000Z',
});

// ------------------------------------------------------------
// Formations
// ------------------------------------------------------------

const f1 = makeFormation(
  {
    title: 'Développement Web Full-Stack : Angular et Spring Boot',
    description:
      'Devenez développeur web full-stack : maîtrisez Angular pour le frontend et Spring Boot pour le backend, du premier composant au déploiement en production.',
    category: 'Développement Web',
    level: 'intermediaire',
    price: 450000,
    status: 'published',
    instructorId: 2,
    image: 'https://picsum.photos/seed/angular/800/450',
    startDate: '2026-09-01T00:00:00.000Z',
    endDate: '2026-12-18T00:00:00.000Z',
    maxStudents: 25,
    objectives: [
      'Construire une application Angular complète avec les signals et le routing',
      'Développer des API REST sécurisées avec Spring Boot',
      'Relier frontend et backend avec HttpClient et l\'authentification JWT',
      'Déployer l\'application en production avec SSR',
    ],
    requirements: ['Notions de base en programmation', 'Un ordinateur avec Node.js installé'],
  },
  '2025-06-01T08:00:00.000Z',
);

const m1 = makeModule(f1.id, 'Fondamentaux du Développement Web', 'Les bases indispensables avant de coder.');
makeLesson(m1, 'Introduction au développement web', 25, {
  description: 'Comment fonctionne le web : HTTP, navigateurs, serveurs.',
  videoUrl: '/videos/lecon-intro.webm',
});
makeLesson(m1, 'HTML5 et CSS3 : les bases du design', 45, { description: 'Structure des pages et mise en forme moderne.' });
makeLesson(m1, 'JavaScript moderne : ES6+ et TypeScript', 60, { description: 'Syntaxe moderne, promesses et typage statique.' });

const m2 = makeModule(f1.id, 'Frontend avec Angular', 'Le framework complet d\'application.');
makeLesson(m2, 'Premiers pas avec Angular : composants et templates', 55, { description: 'Composants standalone, directives et liaison de données.' });
makeLesson(m2, 'Signals et gestion d\'état réactive', 40, { description: 'Signals, computed et effets pour une UI réactive.' });
makeLesson(m2, 'Formulaires réactifs et validation', 35, { description: 'Reactive Forms, validateurs et messages d\'erreur.' });

const m3 = makeModule(f1.id, 'Backend avec Spring Boot', 'Des API robustes et sécurisées.');
makeLesson(m3, 'REST APIs avec Spring Boot', 50, { description: 'Controllers, services et persistence JPA.' });
makeLesson(m3, 'Sécurisation avec Spring Security et JWT', 45, { description: 'Authentification par jeton et contrôle des accès.' });

const f2 = makeFormation(
  {
    title: 'Data Science et Machine Learning avec Python',
    description:
      'Analysez des données, entraînez des modèles de machine learning et produisez des visualisations percutantes avec l\'écosystème Python.',
    category: 'Data Science',
    level: 'debutant',
    price: 550000,
    status: 'published',
    instructorId: 2,
    image: 'https://picsum.photos/seed/python/800/450',
    startDate: '2026-10-05T00:00:00.000Z',
    endDate: '2027-01-22T00:00:00.000Z',
    maxStudents: 20,
    objectives: [
      'Manipuler des jeux de données avec NumPy et Pandas',
      'Créer des visualisations avec Matplotlib et Seaborn',
      'Entraîner et évaluer des modèles de régression et classification',
      'Mettre en place une pipeline de machine learning complète',
    ],
    requirements: ['Aucun prérequis technique', 'Motivation et rigueur'],
  },
  '2025-06-15T08:30:00.000Z',
);

const m4 = makeModule(f2.id, 'Python pour la Data Science', undefined);
makeLesson(m4, 'Python : syntaxe et structures de données', 40, { description: 'Variables, listes, dictionnaires et fonctions.' });
makeLesson(m4, 'NumPy et Pandas : manipulation des données', 55, { description: 'DataFrames, filtrage, agrégation et nettoyage.' });
makeLesson(m4, 'Visualisation avec Matplotlib et Seaborn', 35, { description: 'Graphiques statistiques et personnalisation.' });

const m5 = makeModule(f2.id, 'Machine Learning', undefined);
makeLesson(m5, 'Introduction au Machine Learning', 50, { description: 'Types d\'apprentissage et métriques clés.' });
makeLesson(m5, 'Modèles de régression et classification', 60, { description: 'Régression linéaire, arbres et forêts aléatoires.' });
makeLesson(m5, 'Évaluation des modèles et validation croisée', 40, { description: 'Scores, overfitting et grilles de recherche.' });

const f3 = makeFormation(
  {
    title: 'DevOps et CI/CD : Docker, Kubernetes, GitHub Actions',
    description:
      'Automatisez le cycle de vie de vos applications : conteneurisation Docker, orchestration Kubernetes et pipelines d\'intégration continue.',
    category: 'DevOps',
    level: 'intermediaire',
    price: 600000,
    status: 'published',
    instructorId: 2,
    image: 'https://picsum.photos/seed/devops/800/450',
    startDate: '2026-09-15T00:00:00.000Z',
    endDate: '2026-12-30T00:00:00.000Z',
    maxStudents: 18,
    objectives: [
      'Conteneuriser des applications avec Docker et Compose',
      'Orchestrer des services avec Kubernetes',
      'Construire des pipelines CI/CD avec GitHub Actions',
      'Mettre en place le monitoring et l\'observabilité',
    ],
    requirements: ['Expérience avec Git', 'Connaissance de base de Linux'],
  },
  '2025-07-02T09:15:00.000Z',
);

const m6 = makeModule(f3.id, 'Conteneurisation', undefined);
makeLesson(m6, 'Introduction à DevOps et culture Cloud Native', 30, { description: 'Principes, outils et workflows DevOps.' });
makeLesson(m6, 'Docker : images, conteneurs et Docker Compose', 55, { description: 'Dockerfile, volumes, réseaux et orchestration locale.' });

const m7 = makeModule(f3.id, 'Orchestration', undefined);
makeLesson(m7, 'Kubernetes : pods, deployments et services', 60, { description: 'Déployer et scaler des applications conteneurisées.' });
makeLesson(m7, 'Helm et gestion des environnements', 35, { description: 'Packager et paramétrer des charts.' });

const m8 = makeModule(f3.id, 'Intégration et déploiement continus', undefined);
makeLesson(m8, 'GitHub Actions : pipelines CI/CD', 45, { description: 'Workflows, jobs, secrets et déploiement automatique.' });
makeLesson(m8, 'Monitoring et observabilité', 40, { description: 'Métriques, logs et alerting.' });

const f4 = makeFormation(
  {
    title: 'Cybersécurité : Fondamentaux et Pentest',
    description:
      'Protégez les systèmes d\'information : concepts de sécurité, cryptographie appliquée et méthodologie complète de test d\'intrusion.',
    category: 'Cybersécurité',
    level: 'avance',
    price: 650000,
    status: 'published',
    instructorId: 2,
    image: 'https://picsum.photos/seed/securite/800/450',
    startDate: '2026-11-02T00:00:00.000Z',
    endDate: '2027-02-12T00:00:00.000Z',
    maxStudents: 15,
    objectives: [
      'Comprendre les menaces et le modèle de sécurité',
      'Appliquer la cryptographie aux protocoles réels',
      'Réaliser un pentest complet : recon, scan, exploitation',
      'Rédiger un rapport d\'audit professionnel',
    ],
    requirements: ['Bases solides en réseau', 'Connaissance de Linux'],
  },
  '2025-07-20T10:00:00.000Z',
);

const m9 = makeModule(f4.id, 'Sécurité des systèmes', undefined);
makeLesson(m9, 'Fondamentaux de la cybersécurité', 35, { description: 'Menaces, surface d\'attaque et bonnes pratiques.' });
makeLesson(m9, 'Cryptographie appliquée', 55, { description: 'Chiffrement symétrique, asymétrique et TLS.' });

const m10 = makeModule(f4.id, 'Pentest', undefined);
makeLesson(m10, 'Méthodologie de pentest : recon et scan', 60, { description: 'OSINT, énumération et cartographie du réseau.' });
makeLesson(m10, 'Exploitation et post-exploitation', 65, { description: 'Exploits, escalade de privilèges et persistance.' });
makeLesson(m10, 'Rédaction de rapports d\'audit', 30, { description: 'Structure d\'un rapport et recommandations.' });

const f5 = makeFormation(
  {
    title: 'Développement Mobile avec Flutter',
    description:
      'Créez des applications mobiles iOS et Android à partir d\'un seul codebase Dart avec Flutter : UI, état, API et publication.',
    category: 'Mobile',
    level: 'debutant',
    price: 500000,
    status: 'published',
    instructorId: 2,
    image: 'https://picsum.photos/seed/flutter/800/450',
    startDate: '2026-10-12T00:00:00.000Z',
    endDate: '2027-01-29T00:00:00.000Z',
    maxStudents: 22,
    objectives: [
      'Maîtriser les widgets et le layout Flutter',
      'Gérer l\'état avec Riverpod',
      'Consommer des API REST et persister localement',
      'Publier une application sur les stores',
    ],
    requirements: ['Notions de programmation'],
  },
  '2025-08-05T11:45:00.000Z',
);

const m11 = makeModule(f5.id, 'Découverte de Flutter', undefined);
makeLesson(m11, 'Introduction à Flutter et Dart', 35, { description: 'Le langage Dart et le framework Flutter.' });
makeLesson(m11, 'Widgets et layout : construire une UI', 50, { description: 'Widgets stateless et stateful, arbre de widgets.' });

const m12 = makeModule(f5.id, 'Application complète', undefined);
makeLesson(m12, 'Gestion d\'état avec Riverpod', 45, { description: 'Providers, state et réactivité.' });
makeLesson(m12, 'Navigation et routage', 30, { description: 'Routes nommées, navigation et arguments.' });
makeLesson(m12, 'API REST et persistance locale', 55, { description: 'HTTP, JSON et base de données locale.' });
makeLesson(m12, 'Publication sur les stores', 25, { description: 'Signing, App Store et Play Console.' });

const f6 = makeFormation(
  {
    title: 'Cloud Computing et AWS',
    description:
      'Concevez des architectures cloud robustes et économiques sur AWS : services fondamentaux, serverless et bonnes pratiques Well-Architected.',
    category: 'Cloud',
    level: 'avance',
    price: 700000,
    status: 'published',
    instructorId: 2,
    image: 'https://picsum.photos/seed/aws/800/450',
    startDate: '2026-09-28T00:00:00.000Z',
    endDate: '2027-01-15T00:00:00.000Z',
    maxStudents: 16,
    objectives: [
      'Maîtriser IAM, VPC et la mise en réseau AWS',
      'Déployer sur EC2, S3 et les bases de données managées',
      'Construire des applications serverless avec Lambda',
      'Optimiser coûts et fiabilité avec Well-Architected',
    ],
    requirements: ['Expérience en administration système', 'Notions de réseau'],
  },
  '2025-08-18T13:20:00.000Z',
);

const m13 = makeModule(f6.id, 'Fondamentaux du Cloud', undefined);
makeLesson(m13, 'Architecture Cloud : IaaS, PaaS, SaaS', 30, { description: 'Modèles de service et de déploiement.' });
makeLesson(m13, 'AWS : IAM, VPC et réseaux', 55, { description: 'Identités, permissions et mise en réseau.' });

const m14 = makeModule(f6.id, 'Services AWS', undefined);
makeLesson(m14, 'EC2, S3 et bases de données managées', 60, { description: 'Compute, stockage objet et RDS.' });
makeLesson(m14, 'Serverless : Lambda et API Gateway', 50, { description: 'Fonctions sans serveur et API sécurisées.' });

const m15 = makeModule(f6.id, 'Architecture et coûts', undefined);
makeLesson(m15, 'Conception d\'architectures haute disponibilité', 45, { description: 'Multi-AZ, failover et reprise d\'activité.' });
makeLesson(m15, 'Optimisation des coûts et Well-Architected', 40, { description: 'Pilliers, budget et analyse des coûts.' });

// ------------------------------------------------------------
// Notes (rating) par formation
// ------------------------------------------------------------

ratings.set(f1.id, { sum: 55.2, count: 12 });
ratings.set(f2.id, { sum: 43.2, count: 9 });
ratings.set(f3.id, { sum: 30.8, count: 7 });
ratings.set(f4.id, { sum: 23.5, count: 5 });
ratings.set(f5.id, { sum: 36, count: 8 });
ratings.set(f6.id, { sum: 29.4, count: 6 });

// ------------------------------------------------------------
// Inscriptions
// ------------------------------------------------------------

makeEnrollment(3, f1.id, 'in_progress', '2026-01-12T09:30:00.000Z');
makeEnrollment(3, f2.id, 'completed', '2025-11-03T14:00:00.000Z', 18);
makeEnrollment(4, f1.id, 'in_progress', '2026-02-02T10:15:00.000Z');
makeEnrollment(4, f4.id, 'dropped', '2025-12-15T16:45:00.000Z');
makeEnrollment(5, f3.id, 'in_progress', '2026-01-20T11:30:00.000Z');
makeEnrollment(5, f5.id, 'completed', '2025-10-25T09:00:00.000Z', 16);
makeEnrollment(4, f6.id, 'in_progress', '2026-03-08T15:20:00.000Z');

// ------------------------------------------------------------
// Progression des leçons
// ------------------------------------------------------------

setProgress(3, f1.id, [0, 1, 2], [[3, 60]], '2026-03-01T08:00:00.000Z');
setProgress(3, f2.id, [0, 1, 2, 3, 4, 5], [], '2026-02-10T12:00:00.000Z');
setProgress(4, f1.id, [0, 1], [], '2026-03-15T09:00:00.000Z');
setProgress(4, f4.id, [], [[1, 75]], '2026-01-05T18:30:00.000Z');
setProgress(5, f3.id, [0, 1, 2], [[3, 60]], '2026-04-02T10:00:00.000Z');
setProgress(5, f5.id, [0, 1, 2, 3, 4, 5], [], '2026-02-25T14:45:00.000Z');
setProgress(4, f6.id, [], [[0, 60]], '2026-04-20T09:15:00.000Z');
