import jwt from 'jsonwebtoken';
import type { JWT } from 'next-auth/jwt';

// Called only inside NextAuth's authenticated JWT callback. Roles are deliberately
// absent: every backend request continues to resolve current database permissions.
export function backendAccessToken(token: JWT, secret: string, now = Math.floor(Date.now() / 1000)): string {
  if (!token.email || !token.sub) throw new Error('Authenticated identity is incomplete. Sign in again.');
  if (token.accessToken) {
    try {
      const existing = jwt.verify(token.accessToken, secret, { algorithms: ['HS256'], clockTimestamp: now });
      if (typeof existing !== 'string' && existing.email === token.email && existing.sub === token.sub && typeof existing.exp === 'number' && existing.exp > now + 300) return token.accessToken;
    } catch { /* Renew from the authenticated NextAuth identity, never from old claims. */ }
  }
  return jwt.sign({ sub: token.sub, email: token.email, name: token.name, picture: token.picture, iat: now }, secret, { algorithm: 'HS256', expiresIn: '24h' });
}
