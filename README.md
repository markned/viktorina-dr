# Technique Quiz (`technique_quiz`)

Музыкальная викторина для iPad/ТВ (AirPlay).

## Разработка

```bash
npm install
npm run dev
```

## Деплой на GitHub Pages

### Вариант 1: GitHub Actions (автоматически)

1. Создай репозиторий на GitHub (например, `username/technique_quiz`)
2. Включи Pages: Settings → Pages → Source: GitHub Actions
3. Запушь код в ветку `main` — деплой запустится автоматически
4. Сайт будет доступен по адресу: `https://username.github.io/technique_quiz/`

### Вариант 2: Вручную через gh-pages

```bash
npm install -D gh-pages
npm run deploy
```

Убедись, что в Settings → Pages выбран источник «Deploy from a branch», ветка `gh-pages`, папка `/ (root)`.

## Переименование репозитория на GitHub

После смены имени репозитория на `technique_quiz` обнови URL у себя:

```bash
git remote set-url origin https://github.com/<user>/technique_quiz.git
```

Локальную папку можно переименовать вручную; на работу проекта это не влияет.

## Структура проекта

- `public/content/` — медиа (аудио, видео, фото)
- `rounds.ts` — данные раундов
- `src/helpers/quizConfig.ts` — конфигурация таймингов и путей
