import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';

async function requireAdmin() {
  const user = await getSession();
  return user?.role === 'Admin' ? user : null;
}

export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ success: false, message: 'Acceso exclusivo para administradores.' }, { status: 403 });
    const { data, error } = await createServerSupabase().from('users')
      .select('id,name,email,role,active,created_at').eq('active', true).order('name');
    if (error) throw error;
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'No fue posible consultar los usuarios activos.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: 'Acceso exclusivo para administradores.' }, { status: 403 });
    const { userId } = await request.json();
    if (!userId || typeof userId !== 'string') return NextResponse.json({ success: false, message: 'Usuario inválido.' }, { status: 400 });

    const db = createServerSupabase();
    const { data: target } = await db.from('users').select('id,name,role,active').eq('id', userId).maybeSingle();
    if (!target || !target.active) return NextResponse.json({ success: false, message: 'El usuario no existe o está inactivo.' }, { status: 404 });
    if (target.role === 'Admin') return NextResponse.json({ success: true, message: `${target.name} ya es administrador.`, data: target });

    const { data, error } = await db.from('users').update({ role: 'Admin' }).eq('id', userId).select('id,name,email,role,active,created_at').single();
    if (error) throw error;
    return NextResponse.json({ success: true, message: `${data.name} ahora es administrador.`, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'No fue posible actualizar el rol del usuario.' }, { status: 500 });
  }
}
