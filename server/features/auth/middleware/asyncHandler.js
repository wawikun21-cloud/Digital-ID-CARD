/**
 * Express 4 does not catch rejected promises from async handlers, so a
 * single failing query would crash the whole process. Wrap a handler so
 * the error becomes a JSON 500 response instead.
 */
export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch((err) => {
      console.error(`${req.method} ${req.originalUrl} failed`, err);
      if (res.headersSent) return next(err);
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    });
  };
}
