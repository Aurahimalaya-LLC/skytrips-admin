import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const apiHandler = {
  success: <T>(data: T, meta?: ApiResponse['meta']): NextResponse<ApiResponse<T>> => {
    return NextResponse.json({
      success: true,
      data,
      meta,
    });
  },

  error: (message: string, status: number = 500, code: string = 'INTERNAL_ERROR', details?: unknown): NextResponse<ApiResponse> => {
    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
          details,
        },
      },
      { status }
    );
  },

  badRequest: (message: string, details?: unknown) => apiHandler.error(message, 400, 'BAD_REQUEST', details),
  unauthorized: (message: string = 'Unauthorized') => apiHandler.error(message, 401, 'UNAUTHORIZED'),
  forbidden: (message: string = 'Forbidden') => apiHandler.error(message, 403, 'FORBIDDEN'),
  notFound: (message: string = 'Resource not found') => apiHandler.error(message, 404, 'NOT_FOUND'),
  
  handleError: (error: unknown) => {
    console.error('API Error:', error);
    
    if (error instanceof ZodError) {
      return apiHandler.badRequest('Validation Error', (error as any).errors);
    }

    if (error instanceof Error) {
      return apiHandler.error(error.message);
    }

    return apiHandler.error('An unexpected error occurred');
  }
};

export const getPaginationParams = (url: URL) => {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '10')));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
};
