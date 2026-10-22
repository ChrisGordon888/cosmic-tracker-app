import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
export const config = { api: { bodyParser: { sizeLimit: '16kb' } } };
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method || '')) return res.status(405).json({ error: 'Unsupported method.' });
  if (req.method === 'POST' && req.headers.origin !== `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`) return res.status(403).json({ error: 'Invalid request origin.' });
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (typeof session?.accessToken !== 'string') return res.status(401).json({ error: 'Sign in required.' });
  const path = Array.isArray(req.query.path) ? req.query.path.join('/') : '';
  if (path && !/^[a-f\d]{24}\/(approve|checkout|reconcile|follow-up)$/.test(path)) return res.status(404).json({ error: 'Unknown action.' });
  const base = process.env.SERVICES_BACKEND_URL;
  if (!base) return res.status(503).json({ error: 'Commercial operations are not configured.' });
  try {
    const response = await fetch(`${base.replace(/\/$/, '')}/services/${path}`, { method: req.method, headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' }, ...(req.method === 'POST' ? { body: JSON.stringify(req.body) } : {}), signal: AbortSignal.timeout(20000), cache: 'no-store' });
    return res.status(response.status).json(await response.json());
  } catch { return res.status(503).json({ error: 'Could not confirm the operation. Refresh or reconcile before retrying.' }); }
}
