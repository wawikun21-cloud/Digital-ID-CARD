import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || '';
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters in production');
  }
  return secret;
}

function getJwtExpiry() {
  return process.env.JWT_EXPIRY || '24h';
}

export function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, username: user.username },
    getJwtSecret(),
    { expiresIn: getJwtExpiry() }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}
