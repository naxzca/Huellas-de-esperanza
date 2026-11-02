import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { SessionUser } from './types';

const COOKIE = 'huellas_session';
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || '');

export async function signSession(user: SessionUser) {
  if (!process.env.JWT_SECRET) throw new Error('Falta JWT_SECRET');
  return new SignJWT(user as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('8h').sign(secret());
}

export async function setSession(user: SessionUser) {
  const store = await cookies();
  store.set(COOKIE, await signSession(user), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 8
  });
}

export async function clearSession() { (await cookies()).delete(COOKIE); }

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { id: String(payload.id), name: String(payload.name), email: String(payload.email), role: payload.role as SessionUser['role'] };
  } catch { return null; }
}
