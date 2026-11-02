import Link from 'next/link';
import ForumThread from '@/components/ForumThread';
import { getSession } from '@/lib/auth';
export default async function ThreadPage({params}:PageProps<'/foro/[id]'>){const [{id},user]=await Promise.all([params,getSession()]);return <div className="page"><header className="topbar"><nav className="nav"><Link className="brand" href="/foro">← Foro Huellas</Link><Link href="/">Catálogo</Link></nav></header><main className="container thread-page"><ForumThread id={id} signedIn={!!user}/></main></div>}
