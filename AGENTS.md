# MetaUTP — Contexto permanente del proyecto

> Este archivo va en la **raíz del repositorio**. Codex lo lee automáticamente al iniciar
> cada sesión, así que no hace falta volver a explicar el proyecto en cada chat nuevo.

## Qué es MetaUTP

Aplicación web que ayuda a estudiantes de la UTP (Universidad Tecnológica del Perú) a
descubrir y aprovechar **oportunidades académicas** (becas, reconocimientos,
certificaciones, convocatorias) a partir de su rendimiento real: notas, cursos
matriculados, ciclo, posición académica e inglés.

La premisa del producto: muchos estudiantes cumplen requisitos sin saberlo. MetaUTP lee
sus notas, evalúa las reglas y les muestra qué oportunidades ya tienen al alcance y qué
les falta para el resto.

- **Producción:** https://metautp.vercel.app
- **Repositorio:** https://github.com/jaimeisrael21/MetaUTP_proyecto
- **Ruta local:** `C:\Users\jaime\Documents\Codex\2026-07-18\hol\work\MetaUTP_proyecto`

## Stack

| Pieza | Versión |
|---|---|
| Next.js (App Router) | 16.2.10 |
| React / React DOM | 19.2.4 |
| TypeScript | 5.x |
| Tailwind CSS | 4.3.3 (`@tailwindcss/postcss`) |
| Supabase | `supabase-js` 2.110.7, `@supabase/ssr` 0.12.3 |
| Vercel AI SDK | `ai` 7.0.31 |
| OCR | `tesseract.js` 7.0.0 (idioma `spa`) |
| Validación | `zod` 4.4.3 |
| Gestor de paquetes | **pnpm** (Node.js 20+) |

## Comandos

```bash
pnpm install
cp .env.example .env.local
pnpm dev          # desarrollo
pnpm lint         # ESLint
pnpm build        # build de producción / chequeo de TypeScript
```

## Variables de entorno

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
AI_GATEWAY_MODEL=google/gemini-3-flash
```

- **Nunca** pongas una clave `service_role` en el cliente.
- En Vercel, AI Gateway se autentica con `VERCEL_OIDC_TOKEN`, que la plataforma
  provisiona sola. No hay que configurarlo a mano.

## Estructura (verificar contra el repo antes de asumir)

```
src/app/                 rutas del App Router
  page.tsx               landing
  bienvenida/            onboarding
  configurar/            captura inicial de perfil
  configuracion/         ajustes y preguntas de refinamiento
  panel/                 panel del estudiante
  oportunidades/         listado + [id] detalle
  certificaciones/       (en revisión — ver notas de dominio)
  simulador/             simulador académico
  impacto/
  api/ai/explain/        explicación generada por IA
  api/ai/goal/           guía de meta generada por IA
src/components/          OcrCourseImporter, OpportunityCard, Sidebar, AppShell,
                         StatusBadge, SetupProgress, ProfileRefinementFields,
                         AiOpportunityGuide, GoalGuide, icons
src/data/                types.ts, opportunities.ts, opportunity-rules.ts,
                         academic-period.ts, demo-profile.ts
src/lib/                 matching.ts, store.ts
src/lib/supabase/        browser.ts, server.ts, config.ts, profile-sync.ts,
                         database.types.ts
```

## Reglas de dominio — no negociables

1. **Las reglas determinísticas deciden la elegibilidad. La IA solo explica.**
   `opportunity-rules.ts` + `matching.ts` calculan si el estudiante cumple. La IA
   redacta la explicación y la guía, nunca decide si califica.

2. **No inventar requisitos.** Todo requisito debe venir de una fuente oficial de la UTP
   o de la entidad certificadora. Si una fuente no publica un requisito concreto, el
   estado correcto es *"por confirmar"*, no un requisito inventado.

3. **Estados de requisito:** cumplido / pendiente / por confirmar. La tarjeta muestra
   barra de progreso ("N de M") y lista de requisitos con su estado.

4. **Nada de personalización antes de tener datos.** Si el usuario aún no se identificó,
   la interfaz no debe decir "Oportunidades para Jaime" ni mostrar datos de otra persona.
   Usar "Tus oportunidades" o "Modo invitado".

5. **Las oportunidades se recalculan al responder.** Al contestar las preguntas de perfil,
   las oportunidades que dejan de aplicar desaparecen y aparecen las nuevas que sí aplican.

## Perfil del estudiante — preguntas base

1. **Matrícula:** matriculado y continuo / matriculado pero primer periodo o reingreso /
   no matriculado / egresado.
2. **Periodo anterior:** ¿aprobaste todos tus cursos?
3. **Posición académica:** décimo superior / quinto superior / tercio superior /
   no pertenezco / no la conozco.
4. **Inglés:** aprobé o convalidé Inglés IV / tengo certificado vigente / ambos / ninguno.

En `types.ts` esto se modela como `AcademicRank` (`top_tenth`, `top_fifth`, `top_third`)
y `TriState` para el inglés.

## Cuentas y modos

- **Modo invitado / demo:** sesión temporal. El usuario completa carrera, ciclo, datos
  académicos, cursos y preguntas, y ve cómo cambian sus oportunidades en vivo. Al cerrar
  sesión **no persiste** — es el comportamiento deseado, no un bug.
- **Cuentas guardadas:** perfiles precargados en Supabase con cursos y notas, para
  demostrar comparaciones sin configurar nada en vivo.
- La verificación por correo de Supabase se mantiene **desactivada** a propósito.

## OCR

- Motor: `tesseract.js` con `spa.traineddata`. El archivo de idioma es temporal: si se
  descarga al repo, hay que borrarlo antes de commitear (no debe versionarse).
- El estudiante sube **una sola imagen** con la ficha completa (registro de notas,
  horario/matrícula y resumen académico). No de una en una.
- El parser distingue las columnas **créditos · horas · nota**. Confundirlas fue un bug
  real: se usaban las horas como nota.
- Si una nota sale ilegible, se hace una **segunda lectura enfocada solo en esa celda**.
- Caso de prueba conocido: Arquitectura de Software 16, Gestión de Proyectos 15,
  Inteligencia Artificial 17, Inglés IV 14, Investigación Aplicada 16.
- La entrada manual de notas debe permitir **escribir el número directamente** y subir de
  **1 en 1**, no por decimales.

## UI

- Todas las tarjetas de oportunidad comparten la misma anatomía: etiqueta de tipo, badge
  de estado, título, descripción, barra "Requisitos confirmados N de M", lista de
  requisitos con color por estado, y botón "Ver detalle".
- Cualquier categoría nueva (certificaciones incluidas) debe usar **esa misma anatomía**.
  Nada de tarjetas tipo folleto informativo.
- Barras y paneles laterales solo aparecen cuando ya hay datos que mostrar.
- Móvil: se conserva el apilado natural; las alturas uniformes son solo para escritorio.

## Despliegue

1. Commit y push a `main` en GitHub.
2. Vercel despliega por la integración conectada. **La CLI de Vercel tiene la credencial
   local vencida** — usar la integración, no `vercel --prod`.
3. Verificar sobre **producción**, no sobre la copia local, antes de dar algo por hecho.
4. Avisar al usuario que recargue con `Ctrl + F5` cuando el cambio afecte al OCR o a
   assets cacheados.

## Cómo trabajar en este proyecto

- Antes de cambiar comportamiento de dominio, **explicar primero** y esperar confirmación.
  El usuario prefiere entender el porqué antes de que se toque el código.
- No mezclar un arreglo visual con un cambio de lógica en el mismo commit.
- Correr `pnpm lint` y `pnpm build` antes de publicar.
- Los cambios visuales se verifican mirando la página renderizada, no solo el diff.
- Mantener las respuestas en **español**.

## Higiene de sesiones (importante)

Un chat de Codex de este proyecto llegó a **55 MB** y hacía que la aplicación de escritorio
se cerrara al abrirlo. Los despliegues y el OCR generan salidas enormes que se acumulan en
el archivo de sesión.

- Abre un chat nuevo por fase de trabajo.
- No arrastres un mismo chat durante días de despliegues.
- El contexto duradero vive en este archivo, no en el historial del chat.
