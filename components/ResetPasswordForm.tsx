'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordForm({token}:{token:string}) {
  const [message,setMessage]=useState(''); const [error,setError]=useState(false); const [busy,setBusy]=useState(false); const router=useRouter();
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setMessage('');const values=Object.fromEntries(new FormData(event.currentTarget));if(values.password!==values.passwordConfirmation){setMessage('Las contraseñas no coinciden.');setError(true);setBusy(false);return}try{const response=await fetch('/api/auth/reset-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,token})});const data=await response.json();if(!response.ok)throw new Error(data.message);setMessage(data.message);setError(false);setTimeout(()=>router.replace('/login'),1200)}catch(requestError){setMessage(requestError instanceof Error?requestError.message:'No fue posible cambiar la contraseña.');setError(true);setBusy(false)}}
  return <main className="auth"><section className="auth-card"><Link className="brand" href="/" style={{color:'var(--dark)',justifyContent:'center'}}>🐾 Huellas de Esperanza</Link><h1>Nueva contraseña</h1>{token?<form className="form-grid" onSubmit={submit}><div className="field full"><label>Nueva contraseña</label><input name="password" type="password" minLength={8} autoComplete="new-password" required/></div><div className="field full"><label>Confirmar nueva contraseña</label><input name="passwordConfirmation" type="password" minLength={8} autoComplete="new-password" required/></div>{message&&<div className={`message ${error?'error':'success'}`}>{message}</div>}<button className="button full" disabled={busy}>{busy?'Actualizando...':'Cambiar contraseña'}</button></form>:<div className="message error">El enlace de recuperación está incompleto.</div>}<div className="toggle"><Link href="/olvide-contrasena">Solicitar otro enlace</Link></div></section></main>;
}
