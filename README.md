# Technique Quiz (`technique_quiz`)

Музыкальная викторина для iPad/ТВ (AirPlay).

## Разработка

```bash
npm install
npm run dev
```

### Локальный редактор раундов (только `npm run dev`)

Открой в браузере: **http://localhost:5173/editor**

- Загрузка аудио или превью файла из `public/content/audio/` по полю «Файл», **волна + жёлтая область** для `start` / `end`, кнопки **Play** и **Фрагмент** (воспроизведение выбранного отрезка).
- Ссылка на **Genius** → «Загрузить текст» (работает через dev-сервер Vite, разметка Genius может меняться).
- Ручное редактирование строк, подсказок, **файл mp3**, **фон YouTube** — всё в одном объекте на раунд.
- **Скачать `rounds.ts`** — подставь файл в `src/content/rounds/rounds.ts` и закоммить. Экспорт **JSON** — для бэкапа.
- В прод-сборку (`npm run build`) редактор **не входит** (меньший бандл).

Папку `editor-local/` можно использовать для черновиков (см. `.gitignore`).

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
- `src/content/rounds/rounds.ts` — массив раундов: у каждого `title`, `lyrics`, `audioFile`, опционально `backgroundYoutube`, тайминг `start`/`end`
- `src/helpers/quizConfig.ts` — глобальные тайминги и пути к общим медиа
