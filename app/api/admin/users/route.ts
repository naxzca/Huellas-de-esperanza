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
      .select('id,name,email,role,active,created_at,last_activity_at').eq('active', true).order('name');
    if (error) throw error;
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'No fue posible consultar los usuarios activos.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: 'Acceso exclusivo para administradores.' }, { status: 403 });
    const userId = new URL(request.url).searchParams.get('userId');
    if (!userId) return NextResponse.json({ success: false, message: 'Usuario inválido.' }, { status: 400 });
    if (userId === admin.id) return NextResponse.json({ success: false, message: 'No puedes eliminar tu propia cuenta administrativa.' }, { status: 409 });

    const db = createServerSupabase();
    const { data: target } = await db.from('users').select('id,name,active').eq('id', userId).maybeSingle();
    if (!target || !target.active) return NextResponse.json({ success: false, message: 'El usuario no existe o ya está inactivo.' }, { status: 404 });
    const { error } = await db.from('users').update({ active: false }).eq('id', userId);
    if (error) throw error;
    return NextResponse.json({ success: true, message: `${target.name} fue desactivado correctamente.` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'No fue posible desactivar el usuario.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, message: 'Acceso exclusivo para administradores.' }, { status: 403 });
    const { userId, role } = await request.json();
    if (!userId || typeof userId !== 'string' || !['Admin', 'Adoptante'].includes(role)) {
      return NextResponse.json({ success: false, message: 'Usuario o rol inválido.' }, { status: 400 });
    }
    if (userId === admin.id && role !== 'Admin') {
      return NextResponse.json({ success: false, message: 'No puedes quitarte tus propios permisos de administrador.' }, { status: 409 });
    }

    const db = createServerSupabase();
    const { data: target } = await db.from('users').select('id,name,role,active').eq('id', userId).maybeSingle();
    if (!target || !target.active) return NextResponse.json({ success: false, message: 'El usuario no existe o está inactivo.' }, { status: 404 });
    if (target.role === role) return NextResponse.json({ success: true, message: `${target.name} ya tiene el rol ${role}.`, data: target });

    const { data, error } = await db.from('users').update({ role }).eq('id', userId).select('id,name,email,role,active,created_at').single();
    if (error) throw error;
    const message = role === 'Admin' ? `${data.name} ahora es administrador.` : `${data.name} volvió al rol Adoptante.`;
    return NextResponse.json({ success: true, message, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'No fue posible actualizar el rol del usuario.' }, { status: 500 });
  }
}
