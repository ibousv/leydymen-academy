export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Structure de réponse paginée du backend
 * Utilisée dans ApiResponse<PaginatedResponse<T>>
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}
