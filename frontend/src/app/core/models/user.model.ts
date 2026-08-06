export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
export type UserStatus = 'active' | 'inactive' | 'banned';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  lastLogin?: string;
  phone?: string;
  profileImage?: string | null;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  pageSize?: number;
}

export type UserUpdatePayload = Partial<
  Pick<User, 'firstName' | 'lastName' | 'email' | 'bio' | 'location' | 'website' | 'avatar' | 'role' | 'status'>
>;
