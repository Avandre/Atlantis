# Atlantis

Пошаговый мультиплеер с чатом. Node + Vue 3 + TypeScript + Vite + PostgreSQL.

## Запуск

```bash
npm install
npm run db:up      # PostgreSQL в Docker
npm run dev        # сервер :3000 + клиент :5173
```

Vite печатает `Network: http://192.168.x.x:5173` — этот адрес открывают остальные игроки в локальной сети.
Миграции применяются автоматически при старте сервера.

## Структура

| Пакет | Назначение |
|---|---|
| `packages/shared` | Протокол Socket.IO, zod-схемы, **чистые правила игры** (общие для клиента и сервера) |
| `packages/client` | Vue 3 + Pinia + Vue Router |
| `packages/server` | Fastify + Socket.IO + PostgreSQL. Сервер авторитарен |

Серверные модули: `transport` (HTTP/сокеты, валидация) → `modules/*/service` (сценарии, транзакции) → `repository` (SQL).
