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

  async function changeRole(userId: string, role: 'Admin' | 'Adoptante') {
    if (role === 'Adoptante' && !window.confirm('¿Confirmas que deseas quitarle los permisos de administrador a este usuario?')) return;
    setUpdating(userId); setMessage('');
    try {
      const response = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, role }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setUsers((current) => current.map((user) => user.id === userId ? { ...user, role } : user));
      setMessage(result.message); setError(false);
    } catch (requestError) {
      setMessage(requestError instanceof Error ? requestError.message : 'No fue posible actualizar el rol.'); setError(true);
    } finally { setUpdating(null); }
  }

  async function deactivate(user: AdminUser) {
    if (!window.confirm(`¿Eliminar la cuenta de ${user.name}? El usuario ya no podrá iniciar sesión.`)) return;
    setUpdating(user.id); setMessage('');
    try {
      const response = await fetch(`/api/admin/users?userId=${encodeURIComponent(user.id)}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      setMessage(result.message); setError(false);
    } catch (requestError) {
      setMessage(requestError instanceof Error ? requestError.message : 'No fue posible eliminar el usuario.'); setError(true);
    } finally { setUpdating(null); }
  }

  function inactiveTime(lastActivity: string) {
    const elapsed = Date.now() - new Date(lastActivity).getTime();
    const minutes = Math.max(0, Math.floor(elapsed / 60000));
    if (minutes < 1) return 'Activo ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `Hace ${days} día${days === 1 ? '' : 's'}`;
    const months = Math.floor(days / 30);
    return `Hace ${months} mes${months === 1 ? '' : 'es'}`;
  }

  return <section id="usuarios" className="admin-users-section">
    <div className="admin-section-heading"><div><h2>Usuarios activos</h2><p className="muted">Consulta las cuentas habilitadas y asigna permisos administrativos.</p></div><span className="users-total">{users.length} activos</span></div>
    {message && <div className={`message ${error ? 'error' : 'success'}`}>{message}</div>}
    <div className="users-table-wrap">
      <table className="users-table">
        <thead><tr><th>Usuario</th><th>Correo</th><th>Última actividad</th><th>Rol</th><th>Acciones</th></tr></thead>
        <tbody>{loading ? <tr><td colSpan={5} className="table-state">Cargando usuarios...</td></tr> : users.length === 0 ? <tr><td colSpan={5} className="table-state">No hay usuarios activos.</td></tr> : users.map((user) =>
          <tr key={user.id}><td><div className="user-cell"><span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span><strong>{user.name}{user.id === currentUserId && <small> Tú</small>}</strong></div></td><td>{user.email}</td><td><span className="activity-time">{inactiveTime(user.last_activity_at)}</span><small className="activity-date">{new Date(user.last_activity_at).toLocaleString('es-CO')}</small></td><td><span className={`role-badge ${user.role === 'Admin' ? 'admin' : ''}`}>{user.role}</span></td><td>{user.id === currentUserId ? <span className="admin-check">✓ Tu cuenta</span> : <div className="user-actions">{user.role === 'Admin' ? <button className="demote-button" disabled={updating === user.id} onClick={() => changeRole(user.id, 'Adoptante')}>{updating === user.id ? 'Actualizando...' : 'Quitar administrador'}</button> : <button className="promote-button" disabled={updating === user.id} onClick={() => changeRole(user.id, 'Admin')}>{updating === user.id ? 'Actualizando...' : 'Hacer administrador'}</button>}<button className="delete-user-button" disabled={updating === user.id} onClick={() => deactivate(user)}>Eliminar</button></div>}</td></tr>)}
        </tbody>
      </table>
    </div>
  </section>;
}
