export class AuthError extends Error {
  public readonly code: string | undefined;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

