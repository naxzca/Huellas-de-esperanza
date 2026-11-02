import Link from 'next/link';
import Catalog from '@/components/Catalog';
import LogoutButton from '@/components/LogoutButton';
import { getSession } from '@/lib/auth';

export default async function Home(){const user=await getSession();return <><header className="hero"><nav className="nav"><Link className="brand" href="/"><span className="brand-mark">🐾</span>Huellas de Esperanza</Link><div className="nav-links"><Link className="nav-link optional" href="/foro">Foro</Link>{user?.role==='Admin'&&<Link className="nav-link optional" href="/admin">Administrar</Link>}{user?<LogoutButton/>:<Link className="nav-link" href="/login">Ingresar</Link>}</div></nav><div className="hero-copy"><span className="eyebrow">Adopta, no compres</span><h1>Tu próximo mejor amigo te está esperando</h1><p>Conoce a nuestros peluditos rescatados y encuentra al compañero que llenará tu hogar de amor.</p></div></header><Catalog/><footer>Hecho con amor para quienes dejan huella 🐾</footer></>}
