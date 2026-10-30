declare global {
  namespace Express {
    interface Request {
      /** Set by the auth middleware on protected routes. */
      userId?: string;
    }
  }
}
export {};
