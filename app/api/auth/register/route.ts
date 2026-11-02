import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (!name?.trim() || !email?.trim() || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ success: false, message: 'Completa los datos y usa una contraseña de al menos 8 caracteres.' }, { status: 400 });
    }
    const supabase = createServerSupabase();
    const normalizedEmail = email.trim().toLowerCase();
    const { data: existing } = await supabase.from('users').select('id').eq('email', normalizedEmail).maybeSingle();
    if (existing) return NextResponse.json({ success: false, message: 'El correo ya está registrado.' }, { status: 409 });
    const password_hash = await bcrypt.hash(password, 12);
    const { error } = await supabase.from('users').insert({ name: name.trim(), email: normalizedEmail, password_hash, role: 'Adoptante' });
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Cuenta creada. Ya puedes iniciar sesión.' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'No fue posible crear la cuenta.' }, { status: 500 });
  }
}
