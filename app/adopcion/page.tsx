import { Suspense } from 'react';
import Link from 'next/link';
import AdoptionForm from '@/components/AdoptionForm';
export default function Adoption(){return <div className="page"><header className="topbar"><nav className="nav"><Link className="brand" href="/">🐾 Huellas de Esperanza</Link><Link href="/">← Volver al catálogo</Link></nav></header><main className="form-wrap"><div className="intro"><span className="eyebrow" style={{color:'var(--green)'}}>Un compromiso para toda la vida</span><h1>Solicitud de adopción</h1><p className="muted">Completa tus datos y enviaremos la solicitud formal al refugio mediante WhatsApp.</p></div><Suspense fallback={<div className="panel">Cargando formulario...</div>}><AdoptionForm/></Suspense></main></div>}
