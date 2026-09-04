# Changelog — monorepo-turborepo

Todos los cambios notables de este template se documentan en este archivo.

## [1.0.0]

### Added

- Versión inicial: `apps/api` (basado en `backend-nestjs-prisma`) + `apps/web` (basado en `frontend-nextjs`) + `packages/`, orquestados con Turborepo.
- `docker-compose.yml` combinado (api + web + db).
- Pipeline de GitHub Actions con path filtering de Turborepo (solo testea/buildea lo que cambió).
- README con instrucciones específicas de monorepo.
