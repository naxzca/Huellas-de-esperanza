import Link from 'next/link';
import DonationForm from '@/components/DonationForm';

export default function DonatePage() {
  return <div className="page donation-page"><header className="topbar"><nav className="nav"><Link className="brand" href="/">🐾 Huellas de Esperanza</Link><Link href="/">← Volver al catálogo</Link></nav></header><main className="form-wrap donation-wrap"><div className="intro"><span className="eyebrow" style={{color:'var(--green)'}}>Cada aporte deja una huella</span><h1>Haz una donación</h1><p className="muted">Tu ayuda se convierte en alimento, atención veterinaria y nuevas oportunidades.</p></div><DonationForm/></main></div>;
}
