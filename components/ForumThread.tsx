'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ForumTopic } from '@/lib/types';

export default function ForumThread({ id, signedIn, currentUserId }: { id: string; signedIn: boolean; currentUserId?: string }) {
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const load = () => fetch(`/api/forum/${id}`).then((response) => response.json()).then((result) => { if (!result.success) throw Error(result.message); setTopic(result.data); }).catch((error) => setMessage(error.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  async function reply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const response = await fetch(`/api/forum/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.message); return; }
    form.reset(); setMessage(''); load();
  }

  async function deleteTopic() {
    if (!topic || !window.confirm(`¿Eliminar definitivamente "${topic.title}"? También se eliminarán sus comentarios.`)) return;
    setDeleting(true); setMessage('');
    try {
      const response = await fetch(`/api/forum/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      router.replace('/foro'); router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No fue posible eliminar la publicación.');
      setDeleting(false);
    }
  }

  if (loading) return <div className="state">Cargando experiencia...</div>;
  if (!topic) return <div className="state">{message || 'Experiencia no encontrada.'}</div>;
  return <><article className="thread-topic"><div className="thread-heading"><span className="topic-category">Experiencia</span>{topic.author_id === currentUserId && <button className="delete-topic-button" type="button" disabled={deleting} onClick={deleteTopic}>{deleting ? 'Eliminando...' : 'Eliminar publicación'}</button>}</div><h1>{topic.title}</h1><div className="post-meta">Compartida por {topic.author_name} · {new Date(topic.created_at).toLocaleString('es-CO')}</div><p>{topic.content}</p>{message && <div className="message error thread-message">{message}</div>}</article><h2 className="responses-title">Comentarios ({topic.replies?.length || 0})</h2><section className="replies">{topic.replies?.map((item) => <article className="reply" key={item.id}><div className="avatar">{item.author_name.charAt(0).toUpperCase()}</div><div><div className="post-meta"><strong>{item.author_name}</strong> · {new Date(item.created_at).toLocaleString('es-CO')}</div><p>{item.content}</p></div></article>)}</section>{signedIn && !topic.closed ? <form className="panel reply-form" onSubmit={reply}><div className="field"><label>Deja un comentario</label><textarea name="content" minLength={2} maxLength={2000} required/></div><button className="button">Comentar</button></form> : <div className="forum-notice">{topic.closed ? 'Esta publicación está cerrada.' : 'Inicia sesión para comentar.'}</div>}</>;
}
