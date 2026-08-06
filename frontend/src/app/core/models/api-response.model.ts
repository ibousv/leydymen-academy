/**
 * Enveloppe générale de réponse API du backend.
 * Toutes les réponses du backend utilisent cette structure.
 */
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

/**
 * Données de réponse du login retournées dans ApiResponse.data
 */
export interface LoginResponseData {
  userId: number;
  username: string;
  email: string;
  token: string;
  refreshToken: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  expiresIn: number;
}

/**
 * Données de réponse du refresh token
 */
export interface TokenResponseData {
  token: string;
  refreshToken: string;
  expiresIn: number;
}
