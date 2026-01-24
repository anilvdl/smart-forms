export class APIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public errorMessage?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Normalize unknown errors into Error
 * Safe for logging + API responses
 */
export function toError(err: unknown): Error {
  if (err instanceof Error) return err;

  if (typeof err === "string") {
    return new Error(err);
  }

  try {
    return new Error(JSON.stringify(err));
  } catch {
    return new Error(String(err));
  }
}