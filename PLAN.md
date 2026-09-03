# CLI de Scaffolding — NestJS + Prisma + Next.js

> Generador de proyectos preconfigurados con el stack estándar de desarrollo, listo para producción desde el primer commit.

---

## 1. Objetivo

Eliminar el trabajo repetitivo de iniciar un nuevo proyecto (backend NestJS + Prisma, frontend Next.js, o ambos como monorepo) configurando manualmente linting, testing, Docker, CI/CD y estructura de carpetas. La herramienta debe generar en segundos un proyecto que ya sigue las convenciones y buenas prácticas usadas en proyectos reales (CFert, CaminaStgo, etc.), reduciendo el tiempo de "cero a primer commit útil" de horas a minutos.

**Problema que resuelve:** cada vez que se arranca un proyecto nuevo, se repite manualmente: configurar ESLint/Prettier, estructurar carpetas, definir Dockerfile y docker-compose, dejar lista una pipeline de CI/CD, configurar variables de entorno, y dejar tests base funcionando. Esto es propenso a inconsistencias entre proyectos y consume tiempo que no aporta valor diferencial.

---

## 2. Alcance del proyecto

### 2.1 Dentro del alcance (MVP)

- CLI ejecutable vía `npx` (sin instalación global obligatoria).
- Modo interactivo (prompts) y modo no interactivo (flags + archivo de configuración).
- Tres tipos de proyecto generables:
  - **Backend**: NestJS + Prisma + PostgreSQL.
  - **Frontend**: Next.js (App Router) + TypeScript + Tailwind.
  - **Monorepo**: ambos combinados (estructura tipo `apps/api` + `apps/web`, con Turborepo o Nx).
- Configuración automática incluida en cada proyecto generado:
  - ESLint + Prettier con reglas propias.
  - Husky + lint-staged (pre-commit hooks).
  - Testing base: Jest/Vitest configurado con un test de ejemplo pasando.
  - Dockerfile multi-stage + docker-compose (con servicio de DB para backend).
  - Variables de entorno: `.env.example` generado automáticamente según el tipo de proyecto.
  - Pipeline de CI/CD base (GitHub Actions): lint + test + build en cada PR.
  - README generado con instrucciones específicas del proyecto creado.
- Sistema de templates versionado y extensible (agregar un nuevo template no debería requerir tocar el core del CLI) — ver estrategia detallada en la sección 4.1.
- Publicación como paquete npm público bajo el nombre `nest-next-cli`.

### 2.2 Fuera del alcance (por ahora)

- Soporte para otros frameworks backend (Express puro, Fastify standalone, Django, etc.).
- Generación de infraestructura cloud (Terraform, Pulumi) — puede ser una fase futura.
- UI web para configurar el proyecto (solo CLI en el MVP).
- Migraciones automáticas entre versiones de templates en proyectos ya generados.
- Soporte multi-paquete de gestores (se define uno solo para el MVP, ej. `pnpm`).

### 2.3 Criterios de éxito

- Un proyecto generado debe poder correr `docker-compose up` y quedar funcional sin edición manual adicional (salvo completar el `.env`).
- Tiempo total de generación + primer arranque: menor a 5 minutos.
- Cobertura de tests del propio CLI (no del proyecto generado) sobre 80%.

---

## 3. Herramientas y stack técnico

| Área | Herramienta | Motivo |
|---|---|---|
| Lenguaje del CLI | TypeScript (Node.js) | Consistencia con el resto del stack |
| Framework CLI | [`commander`](https://github.com/tj/commander.js) o [`clack`](https://github.com/natemoo-re/clack) | `clack` da una UX moderna para prompts interactivos; `commander` para parseo de flags |
| Prompts interactivos | `@clack/prompts` | Mejor experiencia visual que `inquirer` |
| Motor de templates | `ejs` o `handlebars` | Renderizado de archivos con variables (nombre proyecto, DB, etc.) |
| Manejo de archivos | `fs-extra` | Copia recursiva de templates con manejo de errores simplificado |
| Gestor de paquetes objetivo | `pnpm` (en los proyectos generados) | Ya usado en tus proyectos, más eficiente en monorepos |
| Testing del CLI | Vitest | Consistente con tu stack actual |
| Empaquetado/build | `tsup` | Build rápido y simple para CLIs en TS |
| Distribución | npm registry | Ejecutable vía `npx nest-next-cli` |
| CI/CD del propio CLI | GitHub Actions | Test + build + publish automático en tags |
| Templates backend | NestJS + Prisma + class-validator + Jest | Réplica de la estructura usada en CFert |
| Templates frontend | Next.js 14+ (App Router) + Tailwind + next-intl opcional | Réplica de la estructura usada en el portfolio |
| Contenedores | Docker + docker-compose | Igual que en proyectos reales ya trabajados |

---

## 4. Arquitectura funcional (alto nivel)

```
cli/
├── src/
│   ├── commands/          # Comandos: create, add, list-templates
│   ├── prompts/           # Flujos de preguntas interactivas
│   ├── generators/        # Lógica de generación por tipo (backend/frontend/monorepo)
│   ├── templates/         # Templates versionados (.ejs / .hbs)
│   │   ├── backend-nestjs-prisma/
│   │   ├── frontend-nextjs/
│   │   └── monorepo-turborepo/
│   ├── utils/              # Helpers: validación de nombre, copia de archivos, git init
│   └── index.ts
├── tests/
└── package.json
```

**Flujo típico:**
1. Usuario ejecuta `npx nest-next-cli`.
2. CLI pregunta: nombre del proyecto, tipo (backend/frontend/monorepo), gestor de DB, si incluir Docker/CI, etc.
3. CLI copia el template correspondiente, reemplaza variables (nombre, autor, año), instala dependencias y corre `git init` + primer commit.
4. CLI imprime instrucciones finales (`cd proyecto && docker-compose up`).

---

### 4.1 Estrategia de versionado de templates

Los templates viven **dentro del propio paquete npm del CLI** (no en repos externos ni registry propio — eso queda para el sistema de plugins del backlog). Con eso como marco, se define:

- **Manifest por template**: cada carpeta de `src/templates/<nombre>/` incluye un `template.json`:
  ```json
  {
    "name": "backend-nestjs-prisma",
    "version": "1.2.0",
    "cliMinVersion": "1.0.0",
    "description": "NestJS + Prisma + PostgreSQL"
  }
  ```
- **Semver independiente por template**, aunque se publican todos juntos en cada release del CLI:
  - **patch**: bump de dependencias del template (ej. subir versión de NestJS) sin cambios estructurales.
  - **minor**: nuevas features opcionales en el template (ej. agregar soporte de `next-intl`) sin romper proyectos ya generados.
  - **major**: cambio estructural o breaking (ej. reestructurar carpetas, cambiar de Jest a Vitest) — implica que un futuro comando de migración (fuera de alcance del MVP, ver 2.2) tendría que manejar el salto.
- **Metadata en el proyecto generado**: al finalizar `create`, el CLI escribe un `.scaffold-meta.json` en la raíz del proyecto generado:
  ```json
  {
    "templateName": "backend-nestjs-prisma",
    "templateVersion": "1.2.0",
    "cliVersion": "1.3.0",
    "generatedAt": "2026-09-03T00:00:00Z"
  }
  ```
  Esto no habilita migraciones automáticas en el MVP, pero deja la trazabilidad lista para cuando se implemente (backlog).
- **Compatibilidad**: el CLI valida `cliMinVersion` del template contra su propia versión al arrancar; si no calza, aborta con mensaje claro en vez de generar un proyecto inconsistente.
- **Changelog**: cada template mantiene su propio `CHANGELOG.md` junto al `template.json`, para que los bumps de versión sean rastreables sin mezclarse con el changelog general del CLI.

---

## 5. Planificación para GitHub (Milestones + Issues)

### Milestone 1 — Fundaciones del CLI
*Objetivo: tener un CLI ejecutable que genere un proyecto mínimo, sin templates completos aún.*

- [ ] Setup inicial del repo (TypeScript, ESLint, Vitest, tsup)
- [ ] Estructura base de comandos con `commander`
- [ ] Implementar prompts interactivos con `@clack/prompts`
- [ ] Comando `create` genera carpeta vacía con nombre validado
- [ ] Sistema de copiado de templates con `fs-extra`
- [ ] Reemplazo de variables en archivos (`{{projectName}}`, etc.)
- [ ] Definir `template.json` (manifest) por template + validación de `cliMinVersion` (ver 4.1)
- [ ] Escribir `.scaffold-meta.json` en el proyecto generado al finalizar `create`
- [ ] Tests unitarios del parser de flags y validaciones

### Milestone 2 — Template Backend (NestJS + Prisma)
*Objetivo: generar un backend funcional completo.*

- [ ] Crear template base NestJS con estructura de módulos estándar
- [ ] Integrar Prisma con schema de ejemplo + migración inicial
- [ ] Configurar ESLint + Prettier + Husky + lint-staged
- [ ] Configurar Jest con test de ejemplo (health check endpoint)
- [ ] Dockerfile multi-stage + docker-compose con PostgreSQL
- [ ] Generar `.env.example` según variables usadas
- [ ] Pipeline GitHub Actions: lint + test + build
- [ ] README autogenerado con instrucciones del proyecto

### Milestone 3 — Template Frontend (Next.js)
*Objetivo: generar un frontend funcional completo.*

- [ ] Crear template base Next.js (App Router) + TypeScript
- [ ] Integrar Tailwind con configuración base
- [ ] Opción de incluir `next-intl` (i18n) desde el prompt
- [ ] Configurar ESLint + Prettier + Husky
- [ ] Configurar Vitest + Testing Library con test de ejemplo
- [ ] Dockerfile para frontend (build + serve)
- [ ] Pipeline GitHub Actions: lint + test + build
- [ ] README autogenerado

### Milestone 4 — Modo Monorepo
*Objetivo: combinar backend y frontend en un solo proyecto generado.*

- [ ] Definir estructura monorepo (`apps/api`, `apps/web`, `packages/`)
- [ ] Integrar Turborepo (o Nx) para orquestar builds/tests
- [ ] Ajustar docker-compose para levantar ambos servicios
- [ ] Pipeline CI/CD combinada con paths filtering (solo testear lo que cambió)
- [ ] Documentación específica de monorepo en el README generado

### Milestone 5 — Pulido, distribución y documentación
*Objetivo: dejar el CLI publicable y usable por terceros.*

- [ ] Manejo de errores robusto (nombre inválido, carpeta ya existe, etc.)
- [ ] Modo no interactivo completo (flags para CI/scripts)
- [ ] Comando `list-templates` para ver opciones disponibles
- [ ] Confirmar disponibilidad final y reservar nombre `nest-next-cli` en npm
- [ ] `CHANGELOG.md` por template (backend/frontend/monorepo) siguiendo la estrategia de 4.1
- [ ] Publicar paquete en npm con versión inicial (`v1.0.0`)
- [ ] Configurar CI/CD del propio CLI (publish automático en tags)
- [ ] Documentación pública (README del repo + landing simple o GitHub Pages)
- [ ] Video/GIF de demo para portfolio

### Backlog (post-MVP, issues sin milestone asignado)

- [ ] Soporte para elegir entre npm/yarn/pnpm
- [ ] Template adicional: solo API sin frontend con GraphQL
- [ ] Sistema de plugins para templates de terceros
- [ ] Comando `add` para agregar features a un proyecto ya generado (ej. agregar auth)
- [ ] Analítica anónima de uso (opt-in) para saber qué templates se usan más

---

## 6. Estimación de tiempo (referencial)

| Milestone | Estimación |
|---|---|
| M1 — Fundaciones | 1 semana |
| M2 — Template Backend | 1.5 semanas |
| M3 — Template Frontend | 1 semana |
| M4 — Monorepo | 1 semana |
| M5 — Pulido y distribución | 1 semana |
| **Total** | **~5.5 semanas** (a ritmo part-time) |

---

## 7. Notas para la entrada en GitHub Projects

- Cada checkbox de este documento corresponde a un **issue** individual.
- Los encabezados `Milestone N` corresponden a **milestones** de GitHub (con fecha estimada de cierre según la tabla de la sección 6).
- Etiquetas sugeridas: `type:feature`, `type:chore`, `type:docs`, `area:backend-template`, `area:frontend-template`, `area:core`.
- El Backlog se ingresa como issues sin milestone, en el board en columna "Backlog".
