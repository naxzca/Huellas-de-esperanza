'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  return <button className="nav-link" onClick={async()=>{await fetch('/api/auth/logout',{method:'POST'});router.push('/login');router.refresh();}}>Cerrar sesión</button>;
}
