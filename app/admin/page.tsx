import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminPanel from '@/components/AdminPanel';
import LogoutButton from '@/components/LogoutButton';
export default async function Admin(){const user=await getSession();if(!user)redirect('/login');if(user.role!=='Admin')redirect('/');return <div className="admin-layout"><aside className="sidebar"><Link className="brand" href="/admin">🐾 Huellas Admin</Link><nav><Link className="side-link active" href="/admin">＋ Registrar mascota</Link><Link className="side-link" href="/">↗ Ver catálogo</Link><LogoutButton/></nav></aside><main className="admin-main"><h1>Nueva mascota</h1><p className="muted">Hola, {user.name}. Agrega un nuevo amigo al catálogo.</p><br/><AdminPanel/></main></div>}
