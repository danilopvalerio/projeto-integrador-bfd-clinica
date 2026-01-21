// types/ApiTypes.ts

export interface ApiErrorDTO {
  error: string;
}

export interface PaginatedResponse<T> {
  data: T[],
  page: number,
  perPage: number,
  total: number,
  totalPages: number;
}
