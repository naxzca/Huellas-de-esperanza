# Huellas de Esperanza

Aplicación full-stack construida con Next.js App Router y Supabase.

## Configuración

1. Ejecuta `database/supabase_schema.sql` en el SQL Editor de Supabase.
2. Copia `.env.local.example` como `.env.local`.
3. Completa `SUPABASE_SECRET_KEY`, `JWT_SECRET` y el teléfono del refugio.
4. Crea el primer administrador usando el bloque comentado al final del script SQL.
5. Instala y ejecuta:

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Rutas

- `/`: catálogo público.
- `/login`: registro e inicio de sesión.
- `/adopcion`: solicitud formal y envío por WhatsApp.
- `/admin`: alta de mascotas, protegida por rol `Admin`.

Las claves `SUPABASE_SECRET_KEY` y `JWT_SECRET` solo se utilizan en el servidor y nunca deben publicarse.
