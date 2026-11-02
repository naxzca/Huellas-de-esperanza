import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerSupabase } from '@/lib/supabase';
import { setSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ success: false, message: 'Correo y contraseña son obligatorios.' }, { status: 400 });
    const { data: user, error } = await createServerSupabase().from('users')
      .select('id,name,email,password_hash,role,active').eq('email', String(email).trim().toLowerCase()).maybeSingle();
    if (error) throw error;
    if (!user || !user.active || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json({ success: false, message: 'Credenciales incorrectas.' }, { status: 401 });
    }
    await createServerSupabase().from('users').update({ last_activity_at: new Date().toISOString() }).eq('id', user.id);
    const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    await setSession(sessionUser);
    return NextResponse.json({ success: true, user: sessionUser });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'No fue posible iniciar sesión.' }, { status: 500 });
  }
}
