# pages

Пустая папка — не удалять.

Next.js игнорирует `src/app` и `src/pages`, если в корне есть `app` или `pages`.
Роутинг лежит в корневой `app/`, а `src/pages` — это слой страниц FSD, а не Pages Router.
Эта папка нужна, чтобы Next не начал собирать роуты из `src/pages`.
