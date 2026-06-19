export {};

// Express 5 extends the global `Express.Request` interface (see @types/express-serve-static-core).
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- official Express augmentation pattern
  namespace Express {
    interface Request {
      /** Set at request start for manifest `attributes.execTime`. */
      startTimeMs?: number;
    }
  }
}
