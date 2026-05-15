# Account Manager — Claude Code Instructions

## Project Overview

Account manager application. Backend NestJS (TypeScript) + Frontend Angular (TypeScript).

## Stack

- **Backend**: NestJS, TypeScript, TypeORM, PostgreSQL
- **Frontend**: Angular, TypeScript, RxJS
- **Monorepo**: pnpm workspaces (`backend/`, `frontend/`)
- **API**: REST (JSON), JWT auth

## BMAD Workflow

Use the specialized agents in order:

| Command | Role | Quand l'utiliser |
|---|---|---|
| `/analyst` | Requirements & PRD | Découverte, nouvelles features |
| `/architect` | Technical design | Architecture, nouveaux modules |
| `/dev-back` | NestJS implementation | Features backend |
| `/dev-front` | Angular implementation | Features frontend |
| `/qa` | Quality assurance | Review, stratégie de tests |

**Ordre recommandé pour une nouvelle feature :**
1. `/analyst` → PRD + epics
2. `/architect` → design technique, ADR
3. Stories dans `docs/stories/`
4. `/dev-back` + `/dev-front` → implémentation
5. `/qa` → review + tests

## Key Documents

- `docs/prd.md` — Product Requirements Document (source de vérité produit)
- `docs/architecture.md` — Architecture & ADRs
- `docs/stories/` — User stories découpées par epic

## ⚠️ Rules

Charger `.claude/RULES.md` avant tout changement de code.