import { Routes } from '@angular/router';
import { ROUTE_PATHS } from './shared/constants';
import { authGuard, roleGuard } from './core/guards';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: ROUTE_PATHS.login },
  {
    path: ROUTE_PATHS.login,
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: ROUTE_PATHS.register,
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: ROUTE_PATHS.forgotPassword,
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: ROUTE_PATHS.notFound,
    loadComponent: () => import('./features/error/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  {
    path: ROUTE_PATHS.serverError,
    loadComponent: () =>
      import('./features/error/server-error/server-error.component').then((m) => m.ServerErrorComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: ROUTE_PATHS.dashboard,
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: ROUTE_PATHS.formations,
        loadComponent: () =>
          import('./features/formations/formation-list/formation-list.component').then(
            (m) => m.FormationListComponent,
          ),
      },
      {
        path: `${ROUTE_PATHS.formations}/${ROUTE_PATHS.formationsCreate}`,
        loadComponent: () =>
          import('./features/formations/formation-form/formation-form.component').then(
            (m) => m.FormationFormComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'INSTRUCTOR'] },
      },
      {
        path: `${ROUTE_PATHS.formations}/${ROUTE_PATHS.formationsDetail}/${ROUTE_PATHS.formationsEdit}`,
        loadComponent: () =>
          import('./features/formations/formation-form/formation-form.component').then(
            (m) => m.FormationFormComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'INSTRUCTOR'] },
      },
      {
        path: `${ROUTE_PATHS.formations}/${ROUTE_PATHS.formationsDetail}`,
        loadComponent: () =>
          import('./features/formations/formation-detail/formation-detail.component').then(
            (m) => m.FormationDetailComponent,
          ),
      },
      // Module Management Routes
      {
        path: `${ROUTE_PATHS.formations}/${ROUTE_PATHS.formationsDetail}/modules`,
        loadComponent: () =>
          import('./features/formations/module-list/module-list.component').then(
            (m) => m.ModuleListComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'INSTRUCTOR'] },
      },
      {
        path: `${ROUTE_PATHS.formations}/${ROUTE_PATHS.formationsDetail}/modules/create`,
        loadComponent: () =>
          import('./features/formations/module-form/module-form.component').then(
            (m) => m.ModuleFormComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'INSTRUCTOR'] },
      },
      {
        path: `${ROUTE_PATHS.formations}/${ROUTE_PATHS.formationsDetail}/modules/:mId/edit`,
        loadComponent: () =>
          import('./features/formations/module-form/module-form.component').then(
            (m) => m.ModuleFormComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'INSTRUCTOR'] },
      },
      // Lesson Management Routes
      {
        path: `${ROUTE_PATHS.formations}/${ROUTE_PATHS.formationsDetail}/modules/:mId/lessons`,
        loadComponent: () =>
          import('./features/formations/lesson-list/lesson-list.component').then(
            (m) => m.LessonListComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'INSTRUCTOR'] },
      },
      {
        path: `${ROUTE_PATHS.formations}/${ROUTE_PATHS.formationsDetail}/modules/:mId/lessons/create`,
        loadComponent: () =>
          import('./features/formations/lesson-form/lesson-form.component').then(
            (m) => m.LessonFormComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'INSTRUCTOR'] },
      },
      {
        path: `${ROUTE_PATHS.formations}/${ROUTE_PATHS.formationsDetail}/modules/:mId/lessons/:lId/edit`,
        loadComponent: () =>
          import('./features/formations/lesson-form/lesson-form.component').then(
            (m) => m.LessonFormComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'INSTRUCTOR'] },
      },
      {
        path: ROUTE_PATHS.students,
        loadComponent: () =>
          import('./features/students/student-list/student-list.component').then(
            (m) => m.StudentListComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'INSTRUCTOR'] },
      },
      {
        path: `${ROUTE_PATHS.students}/${ROUTE_PATHS.studentsDetail}`,
        loadComponent: () =>
          import('./features/students/student-detail/student-detail.component').then(
            (m) => m.StudentDetailComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'INSTRUCTOR'] },
      },
      {
        path: ROUTE_PATHS.enrollments,
        loadComponent: () =>
          import('./features/enrollments/enrollment-list/enrollment-list.component').then(
            (m) => m.EnrollmentListComponent,
          ),
      },
      {
        path: `${ROUTE_PATHS.enrollments}/${ROUTE_PATHS.enrollmentsDetail}`,
        loadComponent: () =>
          import('./features/enrollments/enrollment-detail/enrollment-detail.component').then(
            (m) => m.EnrollmentDetailComponent,
          ),
      },
      {
        path: ROUTE_PATHS.myCourses,
        loadComponent: () =>
          import('./features/my-courses/my-courses-list/my-courses-list.component').then(
            (m) => m.MyCoursesListComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['STUDENT'] },
      },
      {
        path: `${ROUTE_PATHS.myCourses}/${ROUTE_PATHS.coursePlayer}`,
        loadComponent: () =>
          import('./features/my-courses/course-player/course-player.component').then(
            (m) => m.CoursePlayerComponent,
          ),
        canActivate: [roleGuard],
        data: { roles: ['STUDENT'] },
      },
      {
        path: ROUTE_PATHS.profile,
        loadComponent: () =>
          import('./features/profile/profile-view/profile-view.component').then(
            (m) => m.ProfileViewComponent,
          ),
      },
      {
        path: `${ROUTE_PATHS.profile}/${ROUTE_PATHS.profileEdit}`,
        loadComponent: () =>
          import('./features/profile/profile-edit/profile-edit.component').then(
            (m) => m.ProfileEditComponent,
          ),
      },
      {
        path: ROUTE_PATHS.admin,
        loadComponent: () =>
          import('./features/admin/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('./features/admin/admin-dashboard/admin-dashboard.component').then(
                (m) => m.AdminDashboardComponent,
              ),
          },
          {
            path: ROUTE_PATHS.adminUsers,
            loadComponent: () =>
              import('./features/admin/admin-users/admin-users.component').then(
                (m) => m.AdminUsersComponent,
              ),
          },
          {
            path: ROUTE_PATHS.adminFormations,
            loadComponent: () =>
              import('./features/admin/admin-formations/admin-formations.component').then(
                (m) => m.AdminFormationsComponent,
              ),
          },
          {
            path: ROUTE_PATHS.adminStatistics,
            loadComponent: () =>
              import('./features/admin/admin-statistics/admin-statistics.component').then(
                (m) => m.AdminStatisticsComponent,
              ),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: ROUTE_PATHS.notFound },
];
