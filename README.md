# nest-next-cli

Generador de proyectos preconfigurados con el stack estándar de desarrollo (NestJS + Prisma, Next.js, o ambos como monorepo), listos para producción desde el primer commit.

Ver [`PLAN.md`](./PLAN.md) para el plan completo (alcance, stack, milestones y estrategia de versionado de templates).

## Uso

```bash
npx nest-next-cli create
```

Sin argumentos, el CLI pregunta interactivamente el nombre del proyecto, el tipo, y (si es frontend) si incluir `next-intl`.

### Modo con flags (no interactivo)

```bash
npx nest-next-cli create mi-api --type backend --author "Tu Nombre"
npx nest-next-cli create mi-web --type frontend --i18n
npx nest-next-cli create mi-monorepo --type monorepo --yes
```

| Flag | Descripción |
|---|---|
| `[name]` | Nombre del proyecto (argumento posicional) |
| `-t, --type <type>` | `backend`, `frontend` o `monorepo` |
| `--i18n` / `--no-i18n` | Incluir o no `next-intl` (solo aplica a `frontend`) |
| `-a, --author <author>` | Autor a usar en el proyecto generado |
| `-y, --yes` | Modo no interactivo: falla con un mensaje claro si falta información, en vez de preguntar |

El CLI detecta automáticamente cuando no hay una terminal interactiva disponible (CI, scripts, pipes) y se comporta como si se hubiera pasado `--yes`.

### Ver templates disponibles

```bash
npx nest-next-cli list-templates
```

## Templates

| Tipo | Template | Stack |
|---|---|---|
| `backend` | `backend-nestjs-prisma` | NestJS + Prisma + PostgreSQL, health check, Docker, CI |
| `frontend` | `frontend-nextjs` | Next.js (App Router) + TypeScript + Tailwind + Vitest |
| `frontend --i18n` | `frontend-nextjs-intl` | Lo anterior + `next-intl` (rutas `[locale]`) |
| `monorepo` | `monorepo-turborepo` | `apps/api` + `apps/web` orquestados con Turborepo |

Cada template mantiene su propio `CHANGELOG.md` junto a su `template.json` (ver `src/templates/<nombre>/`).

### Versiones de dependencias

Las versiones de las librerías de cada template (NestJS, Next.js, Prisma, React, etc.) se mantienen al día automáticamente mediante el workflow [`update-template-deps.yml`](./.github/workflows/update-template-deps.yml): corre mensualmente (o manualmente vía `workflow_dispatch` en la pestaña Actions), chequea bumps de patch/minor con `npm-check-updates` sobre los `package.json.ejs` de cada template, y abre un PR con los cambios para revisión antes de mergear. Los majors quedan fuera de este proceso automático — se evalúan a mano, ya que pueden romper un template silenciosamente.

## Desarrollo

```bash
pnpm install
pnpm dev      # ejecuta el CLI en modo desarrollo (tsx)
pnpm build    # build de producción con tsup + copia de templates
pnpm test     # corre la suite de Vitest
pnpm lint     # ESLint
```

### Estructura del repo

```
src/
├── commands/     # create, list-templates
├── prompts/      # flujos de preguntas interactivas
├── generators/   # lógica de generación por tipo de proyecto
├── templates/    # templates versionados (cada uno con su template.json y CHANGELOG.md)
├── utils/        # validaciones, copia/render de archivos, manifest
└── index.ts
tests/
```

## Licencia

MIT
