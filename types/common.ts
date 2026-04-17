// ============================================================
// Wamanafo SHS — Common Shared Types
// ============================================================

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface SelectOption {
  value: string;
  label: string;
}

/** Minimal session user shape — same as NextAuth session.user */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId: string;
}
