import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { token, password, passwordConfirmation } = await request.json();
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json({ success: false, message: 'El enlace de recuperación no es válido.' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ success: false, message: 'La nueva contraseña debe tener al menos 8 caracteres.' }, { status: 400 });
    }
    if (password !== passwordConfirmation) {
      return NextResponse.json({ success: false, message: 'Las contraseñas no coinciden.' }, { status: 400 });
    }

    const db = createServerSupabase();
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const now = new Date().toISOString();
    const { data: claimed, error: tokenError } = await db.from('password_reset_tokens')
      .update({ used_at: now }).eq('token_hash', tokenHash).is('used_at', null).gt('expires_at', now)
      .select('user_id').maybeSingle();
    if (tokenError) throw tokenError;
    if (!claimed) return NextResponse.json({ success: false, message: 'El enlace venció o ya fue utilizado. Solicita uno nuevo.' }, { status: 410 });

    const passwordHash = await bcrypt.hash(password, 12);
    const { error } = await db.from('users').update({ password_hash: passwordHash }).eq('id', claimed.user_id).eq('active', true);
    if (error) throw error;
    await db.from('password_reset_tokens').delete().eq('user_id', claimed.user_id).neq('token_hash', tokenHash);
    return NextResponse.json({ success: true, message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, message: 'No fue posible cambiar la contraseña.' }, { status: 500 });
  }
}
