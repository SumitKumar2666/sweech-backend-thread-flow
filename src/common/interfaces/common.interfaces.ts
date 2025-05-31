export interface ApiResponse<T = any> {
    status: 'success' | 'error';
    message?: string;
    data?: T;
  }
  
  export interface PaginationQuery {
    page?: number;
    limit?: number;
  }
  
  export interface PaginationResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface CursorPaginationQuery {
    cursor?: string;
    limit?: number;
  }
  
  export interface CursorPaginationResponse<T> {
    data: T[];
    nextCursor: string | null;
    hasMore: boolean;
  }
  
  export interface JwtPayload {
    sub: string;
    email: string;
  }