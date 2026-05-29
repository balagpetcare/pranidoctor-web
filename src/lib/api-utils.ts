// Phase 4: API Utilities - Error handling and response formatting

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError } from './errors';

/**
 * Standard success response format
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(
    { ok: true, data },
    { status }
  );
}

/**
 * Handle API errors and return appropriate response
 */
export function handleApiError(error: unknown): NextResponse {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
    }));

    return NextResponse.json(
      {
        ok: false,
        error: 'Validation failed',
        details: formattedErrors,
      },
      { status: 400 }
    );
  }

  // Handle known application errors
  if (error instanceof NotFoundError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        code: 'NOT_FOUND',
      },
      { status: 404 }
    );
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        code: 'VALIDATION_ERROR',
      },
      { status: 400 }
    );
  }

  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        code: 'UNAUTHORIZED',
      },
      { status: 401 }
    );
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        code: 'FORBIDDEN',
      },
      { status: 403 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Log unexpected errors
  console.error('Unexpected API error:', error);

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }

  // Unknown error type
  return NextResponse.json(
    {
      ok: false,
      error: 'Internal server error',
    },
    { status: 500 }
  );
}

/**
 * Parse pagination parameters from request
 */
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Parse sorting parameters from request
 */
export function parseSortParams(
  searchParams: URLSearchParams,
  allowedFields: string[],
  defaultField: string = 'createdAt',
  defaultOrder: 'asc' | 'desc' = 'desc'
) {
  const sortBy = searchParams.get('sortBy') ?? defaultField;
  const sortOrder = (searchParams.get('sortOrder') ?? defaultOrder) as 'asc' | 'desc';

  // Validate sort field
  const validSortBy = allowedFields.includes(sortBy) ? sortBy : defaultField;
  const validSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : defaultOrder;

  return { sortBy: validSortBy, sortOrder: validSortOrder };
}

/**
 * Build Prisma where clause from search query
 */
export function buildSearchWhere(
  search: string | null,
  searchableFields: string[]
): any {
  if (!search || search.trim() === '') {
    return {};
  }

  const searchTerm = search.trim();

  return {
    OR: searchableFields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    })),
  };
}

/**
 * Format pagination metadata
 */
export function formatPagination(
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return {
    page,
    limit,
    total,
    totalPages,
    hasMore,
  };
}
