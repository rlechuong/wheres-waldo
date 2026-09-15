import type { SessionContext } from "./session.js";

declare global {
  namespace Express {
    interface Request {
      session?: SessionContext;
    }
  }
}

export {};
