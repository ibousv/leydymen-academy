export type FormationLevel = 'debutant' | 'intermediaire' | 'avance';
export type FormationStatus = 'draft' | 'published' | 'archived';
export type LessonStatus = 'draft' | 'published';

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

export interface FormationDetail extends Formation {
  modules: FormationModule[];
}

export type FormationSort = 'relevance' | 'newest' | 'price' | 'rating';

export interface FormationFilters {
  search?: string;
  category?: string;
  level?: FormationLevel;
  priceMin?: number;
  priceMax?: number;
  status?: FormationStatus;
  sort?: FormationSort;
  page?: number;
  pageSize?: number;
}

export interface FormationPayload {
  title: string;
  description: string;
  category: string;
  level: FormationLevel;
  price: number;
  status: FormationStatus;
  image?: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  objectives: string[];
  requirements: string[];
}

export interface ModulePayload {
  title: string;
  description?: string;
}

export interface LessonPayload {
  title: string;
  description?: string;
  durationMinutes: number;
  videoUrl?: string;
  status: LessonStatus;
}
