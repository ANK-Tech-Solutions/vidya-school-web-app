# Developer guides

| Guide | Topic |
| --- | --- |
| [Setup](setup.md) | Run backend + frontend locally |
| [Architecture](architecture.md) | Repo layout, backend layering, frontend structure, key patterns |
| [API reference](api-reference.md) | REST endpoints by portal |
| [Database & migrations](database-and-migrations.md) | Schema, Flyway, tables |
| [Security & auth](security-and-auth.md) | JWT, roles, path rules, tenancy |
| [Deployment](deployment.md) | Vercel + Render + AWS RDS |

Repo is a monorepo:

```
vidya/
├── school-management-backend/    # Spring Boot 3.4 / Java 17
├── school-management-frontend/   # Next.js 16 / React 19 / TS
├── docs/                         # existing project docs
└── Nani/                         # this knowledge base
```
