import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';

const allowedTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp']
]);
const maxBytes = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ success: false, message: 'Debes iniciar sesión.' }, { status: 401 });
    if (user.role !== 'Admin') return NextResponse.json({ success: false, message: 'Se requieren permisos de administrador.' }, { status: 403 });

    const formData = await request.formData();
    const file = formData.get('image');
    if (!(file instanceof File)) return NextResponse.json({ success: false, message: 'Selecciona una imagen.' }, { status: 400 });
    const extension = allowedTypes.get(file.type);
    if (!extension) return NextResponse.json({ success: false, message: 'Solo se permiten imágenes JPG, PNG o WebP.' }, { status: 400 });
    if (file.size === 0 || file.size > maxBytes) return NextResponse.json({ success: false, message: 'La imagen debe pesar menos de 5 MB.' }, { status: 400 });

    const db = createServerSupabase();
    const path = `${new Date().getUTCFullYear()}/${randomUUID()}.${extension}`;
    const { error } = await db.storage.from('pet-images').upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    const { data } = db.storage.from('pet-images').getPublicUrl(path);
    return NextResponse.json({ success: true, imageUrl: data.publicUrl }, { status: 201 });
  } catch (error) {
    console.error('Pet image upload error:', error);
    return NextResponse.json({ success: false, message: 'No fue posible subir la fotografía. Verifica el bucket pet-images.' }, { status: 500 });
  }
}
