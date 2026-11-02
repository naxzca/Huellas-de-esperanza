import { NextRequest, NextResponse } from 'next/server';
import { createPublicSupabase, createServerSupabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const species = request.nextUrl.searchParams.get('species');
    const adminScope = request.nextUrl.searchParams.get('scope') === 'admin';
    const user = adminScope ? await getSession() : null;
    if (adminScope && user?.role !== 'Admin') {
      return NextResponse.json({ success: false, message: 'Acceso exclusivo para administradores.' }, { status: 403 });
    }
    let query = (adminScope ? createServerSupabase() : createPublicSupabase()).from('pets').select('*').order('last_activity_at', { ascending: false });
    if (!adminScope) query = query.eq('status', 'Disponible');
    if (species === 'Perro' || species === 'Gato') query = query.eq('species', species);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'No fue posible consultar el catálogo.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ success: false, message: 'Debes iniciar sesión.' }, { status: 401 });
    if (user.role !== 'Admin') return NextResponse.json({ success: false, message: 'Se requieren permisos de administrador.' }, { status: 403 });

    const { petId, status } = await request.json();
    if (!petId || !['Disponible', 'En proceso', 'Adoptado'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Mascota o estado inválido.' }, { status: 400 });
    }

    const { data, error } = await createServerSupabase().from('pets')
      .update({ status, last_activity_at: new Date().toISOString() })
      .eq('id', petId)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, message: 'La mascota no existe.' }, { status: 404 });

    return NextResponse.json({ success: true, message: `${data.name} ahora tiene estado ${status}.`, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'No fue posible actualizar la mascota.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ success: false, message: 'Debes iniciar sesión.' }, { status: 401 });
    if (user.role !== 'Admin') return NextResponse.json({ success: false, message: 'Se requieren permisos de administrador.' }, { status: 403 });
    const body = await request.json();
    const pet = {
      name: body.name?.trim(), species: body.species, approximate_age: body.approximateAge?.trim(),
      description: body.description?.trim(), image_url: body.imageUrl?.trim() || null, status: 'Disponible'
    };
    if (!pet.name || !['Perro', 'Gato'].includes(pet.species) || !pet.approximate_age || !pet.description) {
      return NextResponse.json({ success: false, message: 'Completa correctamente todos los campos obligatorios.' }, { status: 400 });
    }
    const { data, error } = await createServerSupabase().from('pets').insert(pet).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, message: `${data.name} fue agregado al catálogo.`, data }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'No fue posible registrar la mascota.' }, { status: 500 });
  }
}
