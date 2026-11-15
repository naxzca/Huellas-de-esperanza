'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { SocialLink } from '@/lib/types';

const platforms:SocialLink['platform'][]=['Instagram','Facebook','TikTok','YouTube','X'];
const icons:Record<SocialLink['platform'],string>={Instagram:'◎',Facebook:'f',TikTok:'♪',YouTube:'▶',X:'𝕏'};

export default function SocialLinksManager(){
  const [links,setLinks]=useState<SocialLink[]>([]);const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState(false);
  useEffect(()=>{fetch('/api/social-links?scope=manage').then((response)=>response.json()).then((result)=>{if(!result.success)throw new Error(result.message);setLinks(platforms.map((platform)=>result.data.find((item:SocialLink)=>item.platform===platform)||{platform,url:'',active:false,updated_at:''}))}).catch((requestError)=>{setMessage(requestError.message);setError(true)}).finally(()=>setLoading(false))},[]);
  function update(platform:SocialLink['platform'],values:Partial<SocialLink>){setLinks((current)=>current.map((link)=>link.platform===platform?{...link,...values}:link))}
  async function submit(event:FormEvent){event.preventDefault();setBusy(true);setMessage('');try{const response=await fetch('/api/social-links',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({links})});const result=await response.json();if(!response.ok)throw new Error(result.message);setLinks(result.data);setMessage(result.message);setError(false)}catch(requestError){setMessage(requestError instanceof Error?requestError.message:'No fue posible guardar los enlaces.');setError(true)}finally{setBusy(false)}}
  if(loading)return <div className="panel state">Cargando configuración...</div>;
  return <form className="panel social-manager" onSubmit={submit}><div className="social-manager-heading"><div><h2>Enlaces públicos</h2><p className="muted">Activa únicamente las redes que deseas mostrar en la parte inferior del catálogo.</p></div></div><div className="social-fields">{links.map((link)=><div className="social-field" key={link.platform}><span className="social-admin-icon">{icons[link.platform]}</span><div className="field"><label htmlFor={`social-${link.platform}`}>{link.platform}</label><input id={`social-${link.platform}`} type="url" value={link.url} placeholder={`https://${link.platform.toLowerCase()}.com/...`} onChange={(event)=>update(link.platform,{url:event.target.value})}/></div><label className="social-toggle"><input type="checkbox" checked={link.active} disabled={!link.url} onChange={(event)=>update(link.platform,{active:event.target.checked})}/><span>Mostrar</span></label></div>)}</div>{message&&<div className={`message ${error?'error':'success'}`}>{message}</div>}<button className="button" disabled={busy}>{busy?'Guardando...':'Guardar enlaces'}</button></form>;
}
