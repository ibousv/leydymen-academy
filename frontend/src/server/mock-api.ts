import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildDashboardStats,
  buildFormationStats,
  buildRevenueStats,
  buildUserStats,
  computeProgress,
  countEnrollmentsByFormation,
  createFormation,
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  enrichEnrollment,
  enrichFormation,
  enrollments,
  enrollmentsForStudent,
  findEnrollment,
  findUserByLogin,
  formationModules,
  formations,
  getFormation,
  getLesson,
  getLessonProgressForStudent,
  getModule,
  getUserById,
  lessons,
  login,
  nextEnrollmentId,
  register,
  setLessonProgress,
  toPublicUser,
  updateFormation,
  updateLesson,
  updateModule,
  users,
  type Enrollment,
  type EnrollmentStatus,
  type Formation,
  type FormationStatus,
  type Paginated,
  type User,
} from './mock-data';

const api = Router();

export const uploadsDir = process.env['LEYDYMEN_UPLOADS_DIR'] ?? join(process.cwd(), 'uploads');
mkdirSync(uploadsDir, { recursive: true });

const uploadStorage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 512 * 1024 * 1024 },
});

function publicFileUrl(req: Request, filename: string): string {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}

function rejectUpload(res: Response, filePath: string | undefined, message: string): void {
  if (filePath && existsSync(filePath)) {
    unlinkSync(filePath);
  }
  res.status(400).json({ message });
}

// ------------------------------------------------------------
// Middlewares
// ------------------------------------------------------------

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 250));
}

api.use(async (_req: Request, _res: Response, next: () => void) => {
  await delay();
  next();
});

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  return header.slice(7).trim() || null;
}

function parseToken(token: string): number | null {
  const match = /^mock-token-(\d+)$/.exec(token);
  return match ? Number(match[1]) : null;
}

function parseRefreshToken(token: string): number | null {
  const match = /^mock-refresh-(\d+)$/.exec(token);
  return match ? Number(match[1]) : null;
}

function requireUser(req: Request, res: Response): User | null {
  const token = getBearerToken(req);
  const userId = token ? parseToken(token) : null;
  const user = userId ? getUserById(userId) : null;
  if (!user || user.status !== 'active') {
    res.status(401).json({ message: 'Non autorisé' });
    return null;
  }
  return user;
}

function requireRoles(req: Request, res: Response, roles: User['role'][]): User | null {
  const user = requireUser(req, res);
  if (user && !roles.includes(user.role)) {
    res.status(403).json({ message: 'Accès refusé' });
    return null;
  }
  return user;
}

function optionalUser(req: Request): User | null {
  const token = getBearerToken(req);
  const userId = token ? parseToken(token) : null;
  const user = userId ? getUserById(userId) : null;
  return user && user.status === 'active' ? user : null;
}

function parsePagination(req: Request): { page: number; pageSize: number } {
  const page = Math.max(1, Number(req.query['page']) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.query['pageSize']) || 6));
  return { page, pageSize };
}

// ------------------------------------------------------------
// Auth
// ------------------------------------------------------------

api.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};
  const user = typeof username === 'string' ? findUserByLogin(username) : undefined;
  if (!user || user.password !== password || user.status !== 'active') {
    res.status(401).json({ message: 'Identifiants invalides' });
    return;
  }
  user.lastActive = new Date().toISOString();
  res.json(login(user));
});

api.post('/auth/register', (req: Request, res: Response) => {
  const { firstName, lastName, email, username, password } = req.body ?? {};
  if (!firstName || !lastName || !email || !username || !password) {
    res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    return;
  }
  const emailTaken = users.some((u) => u.email.toLowerCase() === String(email).toLowerCase());
  const usernameTaken = users.some((u) => u.username.toLowerCase() === String(username).toLowerCase());
  if (emailTaken || usernameTaken) {
    res.status(409).json({
      message: 'Cet email ou ce nom d\'utilisateur est déjà utilisé',
      errors: { email: emailTaken ? 'Cet email est déjà utilisé' : '', username: usernameTaken ? 'Ce nom d\'utilisateur est déjà pris' : '' },
    });
    return;
  }
  const user = register({ firstName: String(firstName), lastName: String(lastName), email: String(email), username: String(username), password: String(password) });
  res.status(201).json(login(user));
});

api.post('/auth/forgot-password', (_req: Request, res: Response) => {
  res.json({ message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' });
});

api.post('/auth/refresh-token', (req: Request, res: Response) => {
  const refreshToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : null;
  const userId = refreshToken ? parseRefreshToken(refreshToken) : null;
  const user = userId ? getUserById(userId) : null;
  if (!user || user.status !== 'active') {
    res.status(401).json({ message: 'Session expirée' });
    return;
  }
  res.json({ token: `mock-token-${user.id}`, refreshToken: `mock-refresh-${user.id}` });
});

api.get('/auth/me', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  res.json(toPublicUser(user));
});

api.post('/auth/logout', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  res.json({ message: 'Déconnecté' });
});

// ------------------------------------------------------------
// Formations
// ------------------------------------------------------------

function buildFormationQuery(req: Request, user: User | null) {
  const { search, category, level, priceMin, priceMax, status, sort } = req.query;
  const isStaff = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';
  const filters: { search?: string; category?: string; level?: string; priceMin?: number; priceMax?: number; status?: FormationStatus; sort?: string } = {
    search: typeof search === 'string' ? search : undefined,
    category: typeof category === 'string' ? category : undefined,
    level: typeof level === 'string' ? level : undefined,
    priceMin: priceMin !== undefined ? Number(priceMin) : undefined,
    priceMax: priceMax !== undefined ? Number(priceMax) : undefined,
    status: typeof status === 'string' ? (status as FormationStatus) : isStaff ? undefined : 'published',
    sort: typeof sort === 'string' ? sort : undefined,
  };
  return filters;
}

api.get('/formations', async (req: Request, res: Response) => {
  const user = await optionalUser(req);
  const f = buildFormationQuery(req, user);
  const { page, pageSize } = parsePagination(req);
  const normalized = [...formations].map(enrichFormation);
  const filtered = normalized.filter((formation) => {
    if (f.status && formation.status !== f.status) {
      return false;
    }
    if (f.category && formation.category !== f.category) {
      return false;
    }
    if (f.level && formation.level !== f.level) {
      return false;
    }
    if (f.priceMin !== undefined && !Number.isNaN(f.priceMin) && formation.price < f.priceMin) {
      return false;
    }
    if (f.priceMax !== undefined && !Number.isNaN(f.priceMax) && formation.price > f.priceMax) {
      return false;
    }
    if (f.search) {
      const needle = f.search.toLowerCase();
      const haystack = `${formation.title} ${formation.description} ${formation.category} ${formation.instructor.firstName} ${formation.instructor.lastName}`.toLowerCase();
      if (!haystack.includes(needle)) {
        return false;
      }
    }
    return true;
  });
  switch (f.sort) {
    case 'newest':
      filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case 'price':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    default:
      filtered.sort((a, b) => b.ratingCount - a.ratingCount);
  }
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  const result: Paginated<Formation> = { items, total: filtered.length, page, pageSize };
  res.json(result);
});

api.get('/formations/:id', async (req: Request, res: Response) => {
  const user = await optionalUser(req);
  const formation = getFormation(Number(req.params['id']));
  if (!formation) {
    res.status(404).json({ message: 'Formation introuvable' });
    return;
  }
  if (formation.status !== 'published' && !(user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR')) {
    res.status(404).json({ message: 'Formation introuvable' });
    return;
  }
  const enriched = enrichFormation(formation);
  const showAllLessons = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';
  const modules = formationModules(formation.id).map((m) => ({
    ...m,
    lessons: showAllLessons ? m.lessons : m.lessons.filter((l) => l.status === 'published'),
  }));
  res.json({ ...enriched, modules });
});

api.post('/formations', (req: Request, res: Response) => {
  const user = requireRoles(req, res, ['ADMIN', 'INSTRUCTOR']);
  if (!user) {
    return;
  }
  const body = req.body ?? {};
  if (!body.title || !body.description || !body.category || !body.level || typeof body.price !== 'number') {
    res.status(400).json({ message: 'Champs obligatoires manquants : title, description, category, level, price' });
    return;
  }
  const formation = createFormation(body, user);
  res.status(201).json(enrichFormation(formation));
});

api.put('/formations/:id', (req: Request, res: Response) => {
  const user = requireRoles(req, res, ['ADMIN', 'INSTRUCTOR']);
  if (!user) {
    return;
  }
  const formation = getFormation(Number(req.params['id']));
  if (!formation) {
    res.status(404).json({ message: 'Formation introuvable' });
    return;
  }
  const body = req.body ?? {};
  const updated = updateFormation(formation, body);
  res.json(enrichFormation(updated));
});

api.delete('/formations/:id', (req: Request, res: Response) => {
  const user = requireRoles(req, res, ['ADMIN']);
  if (!user) {
    return;
  }
  const index = formations.findIndex((f) => f.id === Number(req.params['id']));
  if (index === -1) {
    res.status(404).json({ message: 'Formation introuvable' });
    return;
  }
  formations.splice(index, 1);
  res.status(204).end();
});

api.get('/formations/:id/modules', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  const formation = getFormation(Number(req.params['id']));
  if (!formation) {
    res.status(404).json({ message: 'Formation introuvable' });
    return;
  }
  const showAllLessons = user.role === 'ADMIN' || user.role === 'INSTRUCTOR';
  const modules = formationModules(formation.id).map((m) => ({
    ...m,
    lessons: showAllLessons ? m.lessons : m.lessons.filter((l) => l.status === 'published'),
  }));
  res.json(modules);
});

const LESSON_STATUSES = ['draft', 'published'];

api.post('/formations/:id/modules', (req: Request, res: Response) => {
  const user = requireRoles(req, res, ['ADMIN', 'INSTRUCTOR']);
  if (!user) {
    return;
  }
  const formation = getFormation(Number(req.params['id']));
  if (!formation) {
    res.status(404).json({ message: 'Formation introuvable' });
    return;
  }
  const body = req.body ?? {};
  if (typeof body.title !== 'string' || body.title.trim() === '') {
    res.status(400).json({ message: 'Le titre du module est obligatoire', errors: { title: 'Le titre du module est obligatoire' } });
    return;
  }
  const module = createModule(formation.id, {
    title: body.title.trim(),
    description: typeof body.description === 'string' ? body.description.trim() : undefined,
  });
  res.status(201).json(module);
});

api.put('/modules/:id', (req: Request, res: Response) => {
  const user = requireRoles(req, res, ['ADMIN', 'INSTRUCTOR']);
  if (!user) {
    return;
  }
  const module = getModule(Number(req.params['id']));
  if (!module) {
    res.status(404).json({ message: 'Module introuvable' });
    return;
  }
  const body = req.body ?? {};
  if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim() === '')) {
    res.status(400).json({ message: 'Le titre du module est obligatoire', errors: { title: 'Le titre du module est obligatoire' } });
    return;
  }
  const updated = updateModule(module.id, {
    title: typeof body.title === 'string' ? body.title.trim() : undefined,
    description: body.description === undefined ? undefined : typeof body.description === 'string' ? body.description.trim() : '',
  });
  res.json(updated);
});

api.delete('/modules/:id', (req: Request, res: Response) => {
  const user = requireRoles(req, res, ['ADMIN', 'INSTRUCTOR']);
  if (!user) {
    return;
  }
  if (!deleteModule(Number(req.params['id']))) {
    res.status(404).json({ message: 'Module introuvable' });
    return;
  }
  res.status(204).end();
});

api.post('/modules/:id/lessons', (req: Request, res: Response) => {
  const user = requireRoles(req, res, ['ADMIN', 'INSTRUCTOR']);
  if (!user) {
    return;
  }
  const module = getModule(Number(req.params['id']));
  if (!module) {
    res.status(404).json({ message: 'Module introuvable' });
    return;
  }
  const body = req.body ?? {};
  const errors: Record<string, string> = {};
  if (typeof body.title !== 'string' || body.title.trim() === '') {
    errors['title'] = 'Le titre de la leçon est obligatoire';
  }
  if (typeof body.durationMinutes !== 'number' || !Number.isFinite(body.durationMinutes) || body.durationMinutes <= 0) {
    errors['durationMinutes'] = 'La durée doit être un nombre positif';
  }
  if (body.status !== undefined && !LESSON_STATUSES.includes(body.status)) {
    errors['status'] = 'Le statut doit être draft ou published';
  }
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ message: 'Données de leçon invalides', errors });
    return;
  }
  const lesson = createLesson(module.id, {
    title: body.title.trim(),
    description: typeof body.description === 'string' ? body.description.trim() : undefined,
    durationMinutes: body.durationMinutes,
    videoUrl: typeof body.videoUrl === 'string' ? body.videoUrl.trim() : undefined,
    status: body.status ?? 'draft',
  });
  res.status(201).json(lesson);
});

api.put('/lessons/:id', (req: Request, res: Response) => {
  const user = requireRoles(req, res, ['ADMIN', 'INSTRUCTOR']);
  if (!user) {
    return;
  }
  const lesson = getLesson(Number(req.params['id']));
  if (!lesson) {
    res.status(404).json({ message: 'Leçon introuvable' });
    return;
  }
  const body = req.body ?? {};
  const errors: Record<string, string> = {};
  if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim() === '')) {
    errors['title'] = 'Le titre de la leçon est obligatoire';
  }
  if (body.durationMinutes !== undefined && (typeof body.durationMinutes !== 'number' || !Number.isFinite(body.durationMinutes) || body.durationMinutes <= 0)) {
    errors['durationMinutes'] = 'La durée doit être un nombre positif';
  }
  if (body.status !== undefined && !LESSON_STATUSES.includes(body.status)) {
    errors['status'] = 'Le statut doit être draft ou published';
  }
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ message: 'Données de leçon invalides', errors });
    return;
  }
  const updated = updateLesson(lesson.id, {
    title: typeof body.title === 'string' ? body.title.trim() : undefined,
    description: body.description === undefined ? undefined : typeof body.description === 'string' ? body.description.trim() : '',
    durationMinutes: typeof body.durationMinutes === 'number' ? body.durationMinutes : undefined,
    videoUrl: body.videoUrl === undefined ? undefined : typeof body.videoUrl === 'string' ? body.videoUrl.trim() : '',
    status: typeof body.status === 'string' ? body.status as 'draft' | 'published' : undefined,
  });
  res.json(updated);
});

api.delete('/lessons/:id', (req: Request, res: Response) => {
  const user = requireRoles(req, res, ['ADMIN', 'INSTRUCTOR']);
  if (!user) {
    return;
  }
  if (!deleteLesson(Number(req.params['id']))) {
    res.status(404).json({ message: 'Leçon introuvable' });
    return;
  }
  res.status(204).end();
});

// ------------------------------------------------------------
// Inscriptions
// ------------------------------------------------------------

api.get('/enrollments', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  const { status, formationId, studentId } = req.query;
  const isStaff = user.role === 'ADMIN' || user.role === 'INSTRUCTOR';
  const scoped = isStaff ? [...enrollments] : enrollmentsForStudent(user.id);
  const filtered = scoped.filter((e) => {
    if (status && e.status !== status) {
      return false;
    }
    if (formationId && e.formationId !== Number(formationId)) {
      return false;
    }
    if (studentId && isStaff && e.studentId !== Number(studentId)) {
      return false;
    }
    return true;
  });
  res.json(filtered.map(enrichEnrollment));
});

api.get('/enrollments/:id', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  const enrollment = enrollments.find((e) => e.id === Number(req.params['id']));
  if (!enrollment) {
    res.status(404).json({ message: 'Inscription introuvable' });
    return;
  }
  if (user.role === 'STUDENT' && enrollment.studentId !== user.id) {
    res.status(403).json({ message: 'Accès refusé' });
    return;
  }
  res.json(enrichEnrollment(enrollment));
});

api.post('/enrollments', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  const formationId = Number(req.body?.formationId);
  const formation = getFormation(formationId);
  if (!formation || formation.status !== 'published') {
    res.status(404).json({ message: 'Formation introuvable' });
    return;
  }
  if (findEnrollment(user.id, formationId)) {
    res.status(409).json({ message: 'Vous êtes déjà inscrit à cette formation' });
    return;
  }
  const enrollment: Enrollment = {
    id: nextEnrollmentId(),
    formationId,
    studentId: user.id,
    status: 'in_progress',
    enrollmentDate: new Date().toISOString(),
    completionPercent: 0,
    grade: null,
  };
  enrollments.push(enrollment);
  res.status(201).json(enrichEnrollment(enrollment));
});

api.delete('/enrollments/:id', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  const index = enrollments.findIndex((e) => e.id === Number(req.params['id']));
  if (index === -1) {
    res.status(404).json({ message: 'Inscription introuvable' });
    return;
  }
  const enrollment = enrollments[index];
  if (user.role === 'STUDENT' && enrollment.studentId !== user.id) {
    res.status(403).json({ message: 'Accès refusé' });
    return;
  }
  enrollments.splice(index, 1);
  res.status(204).end();
});

api.patch('/enrollments/:id/status', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  const enrollment = enrollments.find((e) => e.id === Number(req.params['id']));
  if (!enrollment) {
    res.status(404).json({ message: 'Inscription introuvable' });
    return;
  }
  if (user.role === 'STUDENT' && enrollment.studentId !== user.id) {
    res.status(403).json({ message: 'Accès refusé' });
    return;
  }
  const status = req.body?.status as EnrollmentStatus | undefined;
  if (status !== 'in_progress' && status !== 'completed' && status !== 'dropped') {
    res.status(400).json({ message: 'Statut invalide' });
    return;
  }
  enrollment.status = status;
  if (status === 'completed') {
    setLessonProgress(enrollment.studentId, enrollment.formationId);
  }
  res.json(enrichEnrollment(enrollment));
});

api.get('/enrollments/:id/progress', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  const enrollment = enrollments.find((e) => e.id === Number(req.params['id']));
  if (!enrollment) {
    res.status(404).json({ message: 'Inscription introuvable' });
    return;
  }
  if (user.role === 'STUDENT' && enrollment.studentId !== user.id) {
    res.status(403).json({ message: 'Accès refusé' });
    return;
  }
  res.json(computeProgress(enrollment.studentId, enrollment.formationId));
});

// ------------------------------------------------------------
// Utilisateurs
// ------------------------------------------------------------

api.get('/users', (req: Request, res: Response) => {
  const user = requireRoles(req, res, ['ADMIN', 'INSTRUCTOR']);
  if (!user) {
    return;
  }
  const { search, role, status } = req.query;
  const { page, pageSize } = parsePagination(req);
  const filtered = users.filter((u) => {
    if (role && u.role !== role) {
      return false;
    }
    if (status && u.status !== status) {
      return false;
    }
    if (search) {
      const needle = String(search).toLowerCase();
      const haystack = `${u.firstName} ${u.lastName} ${u.email} ${u.username}`.toLowerCase();
      if (!haystack.includes(needle)) {
        return false;
      }
    }
    return true;
  });
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map(toPublicUser);
  const result: Paginated<Omit<User, 'password'>> = { items, total: filtered.length, page, pageSize };
  res.json(result);
});

api.get('/users/:id', (req: Request, res: Response) => {
  const user = requireRoles(req, res, ['ADMIN', 'INSTRUCTOR']);
  if (!user) {
    return;
  }
  const target = getUserById(Number(req.params['id']));
  if (!target) {
    res.status(404).json({ message: 'Utilisateur introuvable' });
    return;
  }
  res.json(toPublicUser(target));
});

api.put('/users/:id', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  const target = getUserById(Number(req.params['id']));
  if (!target) {
    res.status(404).json({ message: 'Utilisateur introuvable' });
    return;
  }
  if (user.role !== 'ADMIN' && target.id !== user.id) {
    res.status(403).json({ message: 'Accès refusé' });
    return;
  }
  const body = req.body ?? {};
  const allowed = ['firstName', 'lastName', 'email', 'bio', 'location', 'website', 'avatar', 'role', 'status'];
  for (const key of allowed) {
    if (body[key] !== undefined) {
      (target as unknown as Record<string, unknown>)[key] = body[key];
    }
  }
  res.json(toPublicUser(target));
});

api.delete('/users/:id', (req: Request, res: Response) => {
  const user = requireRoles(req, res, ['ADMIN']);
  if (!user) {
    return;
  }
  const index = users.findIndex((u) => u.id === Number(req.params['id']));
  if (index === -1) {
    res.status(404).json({ message: 'Utilisateur introuvable' });
    return;
  }
  users.splice(index, 1);
  res.status(204).end();
});

api.post('/users/change-password', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  const { currentPassword, newPassword } = req.body ?? {};
  if (user.password !== currentPassword) {
    res.status(400).json({ message: 'Le mot de passe actuel est incorrect' });
    return;
  }
  if (!newPassword || String(newPassword).length < 6) {
    res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    return;
  }
  user.password = String(newPassword);
  res.json({ message: 'Mot de passe modifié avec succès' });
});

api.post('/users/profile-image', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  const imageUrl = req.body?.imageUrl;
  if (typeof imageUrl !== 'string' || !imageUrl) {
    res.status(400).json({ message: 'imageUrl est obligatoire' });
    return;
  }
  user.avatar = imageUrl;
  res.json({ imageUrl });
});

// ------------------------------------------------------------
// Uploads
// ------------------------------------------------------------

api.post('/uploads/images', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  upload.single('file')(req, res, (error: unknown) => {
    if (error) {
      res.status(400).json({ message: 'Fichier invalide ou trop volumineux' });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'Aucun fichier reçu' });
      return;
    }
    if (!file.mimetype.startsWith('image/')) {
      rejectUpload(res, file.path, 'Le fichier doit être une image (JPG, PNG, WebP, GIF)');
      return;
    }
    res.status(201).json({ url: publicFileUrl(req, file.filename) });
  });
});

api.post('/uploads/videos', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  upload.single('file')(req, res, (error: unknown) => {
    if (error) {
      res.status(400).json({ message: 'Fichier invalide ou trop volumineux' });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'Aucun fichier reçu' });
      return;
    }
    if (!file.mimetype.startsWith('video/')) {
      rejectUpload(res, file.path, 'Le fichier doit être une vidéo (MP4, WebM, OGG)');
      return;
    }
    res.status(201).json({ url: publicFileUrl(req, file.filename) });
  });
});

// ------------------------------------------------------------
// Progression
// ------------------------------------------------------------

function findLessonById(lessonId: number) {
  return lessons.find((l) => l.id === lessonId);
}

api.post('/progress/lessons/:lessonId', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  const lesson = findLessonById(Number(req.params['lessonId']));
  if (!lesson) {
    res.status(404).json({ message: 'Leçon introuvable' });
    return;
  }
  const percent = Number(req.body?.percent);
  if (Number.isNaN(percent) || percent < 0 || percent > 100) {
    res.status(400).json({ message: 'percent doit être un nombre entre 0 et 100' });
    return;
  }
  const result = setLessonProgress(user.id, lesson.moduleId, Number(req.params['lessonId']), percent);
  res.json(result);
});

api.post('/progress/lessons/:lessonId/complete', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  const lesson = findLessonById(Number(req.params['lessonId']));
  if (!lesson) {
    res.status(404).json({ message: 'Leçon introuvable' });
    return;
  }
  const result = setLessonProgress(user.id, lesson.moduleId, Number(req.params['lessonId']), 100);
  res.json(result);
});

api.get('/progress/formation/:formationId', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  const formation = getFormation(Number(req.params['formationId']));
  if (!formation) {
    res.status(404).json({ message: 'Formation introuvable' });
    return;
  }
  if (!findEnrollment(user.id, formation.id)) {
    res.status(404).json({ message: 'Aucune inscription pour cette formation' });
    return;
  }
  res.json(computeProgress(user.id, formation.id));
});

api.get('/progress/lesson/:lessonId', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  const lesson = findLessonById(Number(req.params['lessonId']));
  if (!lesson) {
    res.status(404).json({ message: 'Leçon introuvable' });
    return;
  }
  const progressMap = getLessonProgressForStudent(user.id);
  res.json(progressMap.get(lesson.id) ?? { lessonId: lesson.id, percent: 0, completed: false, updatedAt: '' });
});

// ------------------------------------------------------------
// Statistiques
// ------------------------------------------------------------

api.get('/statistics/dashboard', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  res.json(buildDashboardStats());
});

api.get('/statistics/formation/:formationId', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  const stats = buildFormationStats(Number(req.params['formationId']));
  if (!stats) {
    res.status(404).json({ message: 'Formation introuvable' });
    return;
  }
  res.json(stats);
});

api.get('/statistics/user/:userId', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  const stats = buildUserStats(Number(req.params['userId']));
  if (!stats) {
    res.status(404).json({ message: 'Utilisateur introuvable' });
    return;
  }
  res.json(stats);
});

api.get('/statistics/revenue', (req: Request, res: Response) => {
  const user = requireUser(req, res);
  if (!user) {
    return;
  }
  res.json(buildRevenueStats());
});

export default api;
