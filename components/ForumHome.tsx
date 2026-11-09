'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ForumTopic } from '@/lib/types';

export default function ForumHome({ signedIn, currentUserId }: { signedIn: boolean; currentUserId?: string }) {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/forum').then((response) => response.json()).then((result) => {
      if (!result.success) throw new Error(result.message);
      setTopics(result.data);
    }).catch((error) => setMessage(error.message)).finally(() => setLoading(false));
  }, []);

  async function shareExperience(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch('/api/forum', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, category: 'Historias' }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      router.push(`/foro/${result.data.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No fue posible compartir tu experiencia.');
      setBusy(false);
    }
  }

  async function deleteTopic(topic: ForumTopic) {
    if (!window.confirm(`¿Eliminar definitivamente "${topic.title}"? También se eliminarán sus comentarios.`)) return;
    setDeletingId(topic.id); setMessage('');
    try {
      const response = await fetch(`/api/forum/${topic.id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setTopics((current) => current.filter((item) => item.id !== topic.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No fue posible eliminar la publicación.');
    } finally { setDeletingId(''); }
  }

  return <>
    <div className="forum-actions"><div><span className="eyebrow" style={{ color: 'var(--green)' }}>Historias que dejan huella</span><h1>Experiencias de la comunidad</h1><p className="muted">Conoce historias reales de adopción, rescate y convivencia con animales.</p></div></div>
    <section className="experience-module">
      <div className="experience-copy"><span className="experience-icon">💚</span><h2>Comparte tu experiencia</h2><p>Tu historia puede inspirar a otra persona a adoptar y ayudarla a prepararse para recibir un nuevo integrante en su familia.</p></div>
      {signedIn ? <form className="experience-form" onSubmit={shareExperience}>
        <div className="field"><label htmlFor="experience-title">Título de tu historia</label><input id="experience-title" name="title" minLength={5} maxLength={140} placeholder="Ej. El día que Luna llegó a casa" required /></div>
        <div className="field"><label htmlFor="experience-content">Cuéntanos tu experiencia</label><textarea id="experience-content" name="content" minLength={10} maxLength={3000} placeholder="¿Cómo conociste a tu mascota? ¿Qué aprendieron juntos?" required /></div>
        {message && <div className="message error">{message}</div>}<button className="button orange" disabled={busy}>{busy ? 'Compartiendo...' : 'Compartir mi experiencia'}</button>
      </form> : <div className="experience-login"><p>Inicia sesión para contarle tu historia a la comunidad.</p><Link className="button orange" href="/login">Iniciar sesión</Link></div>}
    </section>
    <h2 className="community-title">Historias compartidas</h2>
    {message && !busy && <div className="message error forum-delete-message">{message}</div>}
    <section className="forum-list">{loading ? <div className="state">Cargando experiencias...</div> : topics.length === 0 ? <div className="state">Todavía no hay experiencias. ¡Comparte la primera!</div> : topics.map((topic) => <article className="topic-card" key={topic.id}><Link className="topic-card-link" href={`/foro/${topic.id}`}><div><span className="topic-category">Experiencia</span><h2>{topic.title}</h2><p>{topic.content}</p><small>Compartida por {topic.author_name} · {new Date(topic.created_at).toLocaleDateString('es-CO')}</small></div><div className="reply-count"><strong>{topic.forum_replies?.[0]?.count || 0}</strong><span>comentarios</span></div></Link>{topic.author_id === currentUserId && <button className="delete-topic-button" type="button" disabled={deletingId === topic.id} onClick={() => deleteTopic(topic)}>{deletingId === topic.id ? 'Eliminando...' : 'Eliminar'}</button>}</article>)}</section>
  </>;
}
