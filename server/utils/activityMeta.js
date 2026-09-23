export function buildActivityMeta(req) {
  return {
    userAgent: req.headers['user-agent'] || 'unknown',
    ip: req.ip || req.connection.remoteAddress || 'unknown',
  };
}
