# Base de datos en Supabase

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor > New query**.
3. Copia y ejecuta todo el archivo `supabase_schema.sql`.
4. Al final del archivo, descomenta el bloque **CREAR EL PRIMER ADMINISTRADOR**.
5. Reemplaza el nombre, correo y contraseña antes de ejecutar únicamente ese `INSERT`.

La contraseña no se almacena directamente: PostgreSQL genera un hash bcrypt con factor 12 mediante `pgcrypto`.

## Conexión del backend

En **Project Settings > Database**, copia la cadena de conexión para el backend. Debe guardarse únicamente en `backend/.env`, nunca en el frontend ni en GitHub:

```env
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:CONTRASENA@HOST:6543/postgres
```

La aplicación Next.js utiliza la Data API de Supabase. Copia `.env.local.example` como `.env.local` y completa:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REEMPLAZAR
SUPABASE_SECRET_KEY=sb_secret_REEMPLAZAR
JWT_SECRET=una_cadena_aleatoria_larga
REFUGE_WHATSAPP_NUMBER=573001234567
```

`SUPABASE_SECRET_KEY` y `JWT_SECRET` son secretos exclusivos del servidor. No deben usar el prefijo `NEXT_PUBLIC_`.

No publiques la contraseña de la base de datos, la secret key ni la antigua `service_role` key. Las claves administrativas deben existir solo en el servidor.
