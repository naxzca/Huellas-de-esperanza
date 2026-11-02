'use client';

import { useEffect, useState } from 'react';
import type { AdminUser } from '@/lib/types';

export default function AdminUsers({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/admin/users').then((response) => response.json()).then((result) => {
      if (!result.success) throw new Error(result.message);
      setUsers(result.data);
    }).catch((requestError) => { setMessage(requestError.message); setError(true); }).finally(() => setLoading(false));
  }, []);

  async function promote(userId: string) {
    setUpdating(userId); setMessage('');
    try {
      const response = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setUsers((current) => current.map((user) => user.id === userId ? { ...user, role: 'Admin' } : user));
      setMessage(result.message); setError(false);
    } catch (requestError) {
      setMessage(requestError instanceof Error ? requestError.message : 'No fue posible actualizar el rol.'); setError(true);
    } finally { setUpdating(null); }
  }

  return <section id="usuarios" className="admin-users-section">
    <div className="admin-section-heading"><div><h2>Usuarios activos</h2><p className="muted">Consulta las cuentas habilitadas y asigna permisos administrativos.</p></div><span className="users-total">{users.length} activos</span></div>
    {message && <div className={`message ${error ? 'error' : 'success'}`}>{message}</div>}
    <div className="users-table-wrap">
      <table className="users-table">
        <thead><tr><th>Usuario</th><th>Correo</th><th>Registro</th><th>Rol</th><th>Acción</th></tr></thead>
        <tbody>{loading ? <tr><td colSpan={5} className="table-state">Cargando usuarios...</td></tr> : users.length === 0 ? <tr><td colSpan={5} className="table-state">No hay usuarios activos.</td></tr> : users.map((user) =>
          <tr key={user.id}><td><div className="user-cell"><span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span><strong>{user.name}{user.id === currentUserId && <small> Tú</small>}</strong></div></td><td>{user.email}</td><td>{new Date(user.created_at).toLocaleDateString('es-CO')}</td><td><span className={`role-badge ${user.role === 'Admin' ? 'admin' : ''}`}>{user.role}</span></td><td>{user.role === 'Admin' ? <span className="admin-check">✓ Administrador</span> : <button className="promote-button" disabled={updating === user.id} onClick={() => promote(user.id)}>{updating === user.id ? 'Actualizando...' : 'Hacer administrador'}</button>}</td></tr>)}
        </tbody>
      </table>
    </div>
  </section>;
}
