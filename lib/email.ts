function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Falta configurar ${name}`);
  return value;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character);
}

export async function sendPasswordResetEmail({ to, name, resetUrl }: { to: string; name: string; resetUrl: string }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${required('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: required('RESEND_FROM_EMAIL'),
      to: [to],
      subject: 'Restablece tu contraseña — Huellas de Esperanza',
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#21332d"><h1 style="color:#14543e">Huellas de Esperanza</h1><p>Hola, ${escapeHtml(name)}.</p><p>Recibimos una solicitud para restablecer tu contraseña. Este enlace vence en 30 minutos y solo puede utilizarse una vez.</p><p style="margin:30px 0"><a href="${escapeHtml(resetUrl)}" style="padding:13px 20px;border-radius:10px;background:#1f7a5a;color:white;text-decoration:none;font-weight:bold">Crear una nueva contraseña</a></p><p>Si no solicitaste este cambio, ignora este correo. Tu contraseña actual seguirá funcionando.</p></div>`
    })
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend rechazó el correo (${response.status}): ${detail}`);
  }
}
