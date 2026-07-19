import type { VisitorSession } from '../application/visitor-session/visitor-session.entity';

export {};

// Express 5 extends the global `Express.Request` interface (see @types/express-serve-static-core).
declare global {
  namespace Express {
    interface Request {
      /** Set at request start for manifest `attributes.execTime`. */
      startTimeMs?: number;
      /** Set by `VisitorSessionMiddleware` for visitor-scoped routes. */
      visitorSession?: VisitorSession;
    }
  }
}
