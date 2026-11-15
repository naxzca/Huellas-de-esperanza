import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { sendPasswordResetEmail } from '@/lib/email';

const genericMessage = 'Si el correo está registrado, recibirás un enlace de recuperación en unos minutos.';

export async function POST(request: Request) {
  try {
    const email = String((await request.json()).email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Ingresa un correo electrónico válido.' }, { status: 400 });
    }

    const db = createServerSupabase();
    const { data: user, error } = await db.from('users').select('id,name,email,active').eq('email', email).maybeSingle();
    if (error) throw error;
    if (!user?.active) return NextResponse.json({ success: true, message: genericMessage });

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    await db.from('password_reset_tokens').delete().eq('user_id', user.id).is('used_at', null);
    const { error: insertError } = await db.from('password_reset_tokens').insert({ user_id: user.id, token_hash: tokenHash, expires_at: expiresAt });
    if (insertError) throw insertError;

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, '');
      await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl: `${baseUrl}/restablecer-contrasena?token=${token}` });
    } catch (emailError) {
      await db.from('password_reset_tokens').delete().eq('token_hash', tokenHash);
      throw emailError;
    }
    return NextResponse.json({ success: true, message: genericMessage });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, message: 'No fue posible enviar el correo de recuperación. Inténtalo más tarde.' }, { status: 500 });
  }
}
