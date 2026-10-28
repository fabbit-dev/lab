# Работа с репозиторием

Каждый пуш в `main` публикует страницу на lab.fabbit.dev. Изменения вносите через pull request.

## Цикл

```bash
git switch main && git pull
git switch -c feat/world-art
# Внесите изменения, затем проверьте перед коммитом
npm test && npm run build
git add <файлы>
git commit -m "feat(art): стол Fabbit для мира"
git push -u origin HEAD            # -u только для первого пуша
gh pr create --fill --title "feat(art): стол Fabbit для мира"
gh pr merge --squash --delete-branch
git switch main && git pull
```

При squash-слиянии заголовок PR становится заголовком коммита в `main`.

## Ветки

| Префикс | Для чего | Пример |
|---|---|---|
| `feat/` | Раздел, спрайт или компонент | `feat/world-art` |
| `fix/` | Исправление ошибки | `fix/panel-width` |
| `docs/` | README или тексты без кода | `docs/copy` |
| `style/` | Вёрстка без логики | `style/header` |

Одна ветка на задачу. Срок жизни ветки: один-два дня.

## Коммиты

Используйте `тип(область): что сделано`, описание по-русски. Область обозначает раздел страницы или каталог.
Типы: `feat`, `fix`, `docs`, `style`, `chore`, `refactor`, `test`, `perf`.
Один коммит на одно изменение.

## Графика

Спрайты описаны кодом в `art/sprites/`. `npm run art` собирает PNG в `public/world/`.
Готовые PNG руками не правьте: измените исходник и пересоберите.

## Перед слиянием

Запустите `npm run build && npm run preview`. Проверьте страницу шириной 375 и 1440 px. Исправьте ошибки в консоли.

## Нельзя

- Пушить в `main` или использовать `git push --force` в общих ветках.
- Коммитить `dist/` и `art/out/`.
- Держать ветку неделями.
