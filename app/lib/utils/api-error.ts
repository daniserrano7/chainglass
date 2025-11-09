/**
 * API Error handling utilities
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown): Response {
  // Development logging
  if (process.env.NODE_ENV === "development") {
    console.error("API Error:", error);
  }

  // Handle ApiError
  if (error instanceof ApiError) {
    return Response.json(
      {
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.details : undefined,
      },
      { status: error.statusCode }
    );
  }

  // Handle standard Error
  if (error instanceof Error) {
    return Response.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return Response.json(
    {
      error: "An unexpected error occurred",
      details: process.env.NODE_ENV === "development" ? String(error) : undefined,
    },
    { status: 500 }
  );
}

export function createValidationError(message: string): ApiError {
  return new ApiError(message, 400);
}

export function createNotFoundError(message: string): ApiError {
  return new ApiError(message, 404);
}

export function createServerError(message: string, details?: unknown): ApiError {
  return new ApiError(message, 500, details);
}
