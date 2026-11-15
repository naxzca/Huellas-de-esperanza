import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';
import SocialLinksManager from '@/components/SocialLinksManager';

export default async function SocialSettingsPage(){const user=await getSession();if(!user)redirect('/login');if(user.role!=='Admin'&&user.role!=='Redes')redirect('/');return <div className="page"><header className="topbar"><nav className="nav"><Link className="brand" href="/">🐾 Huellas de Esperanza</Link><div className="nav-links"><Link href="/">Catálogo</Link>{user.role==='Admin'&&<Link href="/admin">Administración</Link>}<LogoutButton/></div></nav></header><main className="container social-settings"><span className="eyebrow" style={{color:'var(--green)'}}>Gestión de comunidad</span><h1>Redes sociales</h1><p className="muted">Hola, {user.name}. Configura los enlaces que aparecerán públicamente en el catálogo.</p><SocialLinksManager/></main></div>}
