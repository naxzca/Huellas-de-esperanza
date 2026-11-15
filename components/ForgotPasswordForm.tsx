'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordForm() {
  const [message,setMessage]=useState(''); const [error,setError]=useState(false); const [busy,setBusy]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setMessage('');try{const response=await fetch('/api/auth/forgot-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))});const data=await response.json();if(!response.ok)throw new Error(data.message);setMessage(data.message);setError(false);event.currentTarget.reset()}catch(requestError){setMessage(requestError instanceof Error?requestError.message:'No fue posible enviar el correo.');setError(true)}finally{setBusy(false)}}
  return <main className="auth"><section className="auth-card"><Link className="brand" href="/" style={{color:'var(--dark)',justifyContent:'center'}}>🐾 Huellas de Esperanza</Link><h1>Recuperar contraseña</h1><p className="muted auth-description">Escribe el correo de tu cuenta. Te enviaremos un enlace válido durante 30 minutos.</p><form className="form-grid" onSubmit={submit}><div className="field full"><label>Correo electrónico</label><input name="email" type="email" autoComplete="email" required/></div>{message&&<div className={`message ${error?'error':'success'}`}>{message}</div>}<button className="button full" disabled={busy}>{busy?'Enviando...':'Enviar enlace de recuperación'}</button></form><div className="toggle"><Link href="/login">← Volver a iniciar sesión</Link></div></section></main>;
}
