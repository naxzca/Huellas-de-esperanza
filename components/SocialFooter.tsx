import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase';
import type { SocialLink } from '@/lib/types';

const icons:Record<SocialLink['platform'],string>={Instagram:'◎',Facebook:'f',TikTok:'♪',YouTube:'▶',X:'𝕏'};
export default async function SocialFooter(){
  const {data}=await createServerSupabase().from('social_links').select('platform,url,active,updated_at').eq('active',true).neq('url','').order('platform');
  const links=(data||[]) as SocialLink[];
  return <footer className="site-footer"><div><strong>Huellas de Esperanza</strong><p>Síguenos y ayuda a que más mascotas encuentren un hogar.</p></div>{links.length>0&&<nav className="social-links" aria-label="Redes sociales">{links.map((link)=><Link key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.platform}><span>{icons[link.platform]}</span>{link.platform}</Link>)}</nav>}<small>Hecho con amor para quienes dejan huella 🐾</small></footer>;
}
