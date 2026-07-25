# MetaUTP

MetaUTP es un orientador independiente para estudiantes de la UTP. Conserva un catálogo de 38 oportunidades institucionales y 9 rutas de certificación documentadas, y compara sus requisitos con los datos que el estudiante decide registrar.

El producto separa tres responsabilidades:

- El motor de reglas calcula requisitos numéricos de forma determinística.
- Supabase autentica cuentas personales y guarda únicamente los datos del usuario dueño de cada fila.
- La IA explica resultados y próximos pasos, pero no puede cambiar el cumplimiento ni afirmar una admisión.

## Experiencia principal

- Catálogo completo con categorías y filtros de vigencia.
- Orden personalizado por reglas determinísticas, con búsqueda, categorías y paginación.
- Motivo visible para cada puesto del orden personal.
- Estados diferenciados: cumple, está cerca, falta un dato, validación oficial y no cumple aún.
- Carga manual de cursos u OCR en el navegador con revisión humana antes de guardar.
- Detalle de cada oportunidad con fuente, fecha de revisión y siguiente acción.
- Explicación con IA bajo demanda, con respuesta determinística de respaldo si el proveedor falla.
- Diseño web responsive; no requiere una aplicación móvil nativa para la exposición.

## Desarrollo local

Requisitos: Node.js 20 o superior y pnpm.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Variables:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
AI_GATEWAY_MODEL=google/gemini-3-flash
```

No agregues una clave `service_role` al cliente. En Vercel, AI Gateway usa `VERCEL_OIDC_TOKEN`, que la plataforma provisiona automáticamente. El modelo puede cambiarse por un identificador compatible como `anthropic/...`, `openai/...`, `google/...` o un proveedor disponible en Gateway.

## Base de datos

La migración inicial está en `supabase/migrations/202607180001_student_profiles.sql` y crea:

- `profiles`
- `courses`
- `saved_opportunities`

Las tres tablas tienen Row Level Security. Un usuario autenticado solo puede leer o modificar sus propias filas; el rol anónimo no tiene acceso.

## Verificación

```bash
pnpm verify
```

Ejecuta ESLint, TypeScript y el build de producción.

## Despliegue

El repositorio está preparado para Vercel. Configura las variables de Supabase en Development, Preview y Production, enlaza el proyecto y despliega:

```bash
vercel link
vercel env pull .env.local
vercel --prod
```

La experiencia de demostración conserva un acceso local explícito para que una caída de correo, Supabase o red no bloquee la exposición.
