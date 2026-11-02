import Link from 'next/link';
import ForumHome from '@/components/ForumHome';
import LogoutButton from '@/components/LogoutButton';
import { getSession } from '@/lib/auth';
export default async function ForumPage(){const user=await getSession();return <div className="page"><header className="topbar"><nav className="nav"><Link className="brand" href="/">🐾 Huellas de Esperanza</Link><div className="nav-links"><Link href="/">Catálogo</Link>{user?<LogoutButton/>:<Link className="nav-link" href="/login">Ingresar</Link>}</div></nav></header><main className="container forum-page"><ForumHome signedIn={!!user}/></main></div>}
