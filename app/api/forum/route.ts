import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const { data, error } = await createServerSupabase().from('forum_topics')
      .select('id,title,content,category,author_name,closed,created_at,updated_at,forum_replies(count)')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    const message = (error as { code?: string })?.code === 'PGRST205'
      ? 'El módulo de experiencias aún no está configurado en Supabase.'
      : 'No fue posible cargar las experiencias.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ success: false, message: 'Debes iniciar sesión para publicar.' }, { status: 401 });
    const body = await request.json();
    const title = String(body.title || '').trim();
    const content = String(body.content || '').trim();
    const categories = ['General', 'Adopción', 'Cuidados', 'Historias', 'Ayuda'];
    if (title.length < 5 || title.length > 140 || content.length < 10 || content.length > 3000 || !categories.includes(body.category)) {
      return NextResponse.json({ success: false, message: 'Revisa el título, categoría y contenido.' }, { status: 400 });
    }
    const { data, error } = await createServerSupabase().from('forum_topics').insert({
      author_id: user.id, author_name: user.name, title, content, category: body.category
    }).select('id').single();
    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error(error);
    const message = (error as { code?: string })?.code === 'PGRST205'
      ? 'Primero debes crear las tablas del módulo de experiencias en Supabase.'
      : 'No fue posible compartir tu experiencia.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
