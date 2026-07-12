# tc_plant

Сайт на [Next.js](https://nextjs.org) 16 (App Router, TypeScript, Tailwind CSS v4).

## Запуск

```bash
npm install
npm run dev      # http://localhost:3000
```

Другие команды:

```bash
npm run build    # продакшн-сборка
npm run start    # запуск собранного приложения
npm run lint     # ESLint
```

## Структура

- `src/app/` — маршруты и страницы (App Router)
- `public/` — статические файлы
- `AGENTS.md` — заметки для ИИ-агентов (важно: Next.js 16 содержит ломающие изменения)

## Ветки

- **`main`** — стабильная, деплоящаяся ветка.
- **Фича-ветки** (`feature/...`, `fix/...`) — ответвляются от `main`, вливаются через pull request.

## Инструменты разработки

- **spec-kit** (`.specify/`, скилы `speckit-*`) — спецификационная разработка.
- **Context7 MCP** (`.mcp.json`) — актуальная документация библиотек.
- **Дизайн-скилы** (`.claude/skills`, `.agents/skills`, `.impeccable`) — impeccable,
  taste-skill, emilkowalski: визуал, типографика, анимации. Версии — в `skills-lock.json`.
