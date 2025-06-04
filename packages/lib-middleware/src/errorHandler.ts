export class APIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number
  ) {
    super(message);
    Object.setPrototypeOf(this, APIError.prototype);
  }
}
