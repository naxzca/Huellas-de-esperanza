import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET(_request: Request, context: RouteContext<'/api/forum/[id]'>) {
  try {
    const { id } = await context.params;
    const db = createServerSupabase();
    const [{ data: topic, error }, { data: replies, error: repliesError }] = await Promise.all([
      db.from('forum_topics').select('*').eq('id', id).maybeSingle(),
      db.from('forum_replies').select('*').eq('topic_id', id).order('created_at')
    ]);
    if (error || repliesError) throw error || repliesError;
    if (!topic) return NextResponse.json({ success: false, message: 'Tema no encontrado.' }, { status: 404 });
    return NextResponse.json({ success: true, data: { ...topic, replies } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'No fue posible cargar la conversación.' }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext<'/api/forum/[id]'>) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ success: false, message: 'Debes iniciar sesión para responder.' }, { status: 401 });
    const { id } = await context.params;
    const content = String((await request.json()).content || '').trim();
    if (content.length < 2 || content.length > 2000) return NextResponse.json({ success: false, message: 'La respuesta debe tener entre 2 y 2000 caracteres.' }, { status: 400 });
    const db = createServerSupabase();
    const { data: topic } = await db.from('forum_topics').select('closed').eq('id', id).maybeSingle();
    if (!topic) return NextResponse.json({ success: false, message: 'Tema no encontrado.' }, { status: 404 });
    if (topic.closed) return NextResponse.json({ success: false, message: 'Esta conversación está cerrada.' }, { status: 409 });
    const { data, error } = await db.from('forum_replies').insert({ topic_id: id, author_id: user.id, author_name: user.name, content }).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'No fue posible publicar la respuesta.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext<'/api/forum/[id]'>) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ success: false, message: 'Debes iniciar sesión.' }, { status: 401 });
    const { id } = await context.params;
    const db = createServerSupabase();
    const { data: topic, error: findError } = await db.from('forum_topics').select('id,author_id').eq('id', id).maybeSingle();
    if (findError) throw findError;
    if (!topic) return NextResponse.json({ success: false, message: 'Tema no encontrado.' }, { status: 404 });
    if (topic.author_id !== user.id) return NextResponse.json({ success: false, message: 'Solo el autor puede eliminar esta publicación.' }, { status: 403 });

    const { error } = await db.from('forum_topics').delete().eq('id', id).eq('author_id', user.id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'La experiencia fue eliminada.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'No fue posible eliminar la publicación.' }, { status: 500 });
  }
}
