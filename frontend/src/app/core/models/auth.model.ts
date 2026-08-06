import type { User } from './user.model';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
