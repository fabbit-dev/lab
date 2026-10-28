# Мастерская Fabbit

Страница [lab.fabbit.dev](https://lab.fabbit.dev) и пиксельная графика для онлайн-мира Тыкворкинга МЭИ.
Сам прибор: [fabbit-dev/fabbit](https://github.com/fabbit-dev/fabbit), основной сайт: [fabbit.dev](https://fabbit.dev).

## Запуск

Node.js 22 и npm.

```bash
npm ci
npm run dev
```

Откройте [localhost:5191](http://localhost:5191).

| Команда | Что делает |
|---|---|
| `npm test` | Тесты Vitest |
| `npm run build` | Сборка в `dist/` |
| `npm run preview` | Просмотр сборки на [localhost:4174](http://localhost:4174) |
| `npm run art` | Спрайты из `art/sprites/` в `public/world/`, картинки страницы из `art/page/` в `public/img/` |
| `npm run art -- --mock` | И мокап на куске карты мира в `art/out/mock.png` |

## Страница

Ванильный JS, одна страница `index.html`. Вёрстка под боковую вкладку мира шириной около 400 px, на десктопе два столбца.

```text
src/screen.js   экран прибора 64×48: осциллограф, логика, ретро
src/geom.js     прямоугольники экрана и узлов платы
src/copy.js     тексты профилей и узлов
art/page/       прибор и плата, пиксельные картинки страницы
```

## Графика для мира

Клетка мира 32×32 px. PNG в 1x, прозрачный фон, палитра из тайлсета мира (`art/palette.js`).

| Файл | Размер | Ссылка |
|---|---|---|
| `public/world/fabbit-desk.png` | 96×64 | lab.fabbit.dev |
| `public/world/fabbit-poster.png` | 64×64 | fabbit.dev |
| `public/world/bunny-pumpkin.png` | 32×32 | lab.fabbit.dev |

Изменения через PR: [CONTRIBUTING.md](CONTRIBUTING.md). Пуш в `main` публикует страницу на GitHub Pages.
