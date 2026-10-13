### Deployment (Docker)

### Editorial Telegram bot

The backend exposes `https://obucheniya.com/api/bot/v1/` for the editorial bot. Set
`BOT_INTEGRATION_TOKEN` and `SITE_URL=https://obucheniya.com` in the site's private
`.env`; give the bot the same secret through `IET_SHOP_INTEGRATION_TOKEN`. The bot's
`SITES_JSON` entry uses `id=iet-shop`, `name=IET Shop`, and
`api_base=https://obucheniya.com/api/bot/v1/`. Do not commit either private `.env`.

Run `python manage.py migrate` after deployment. The production entrypoint runs it
automatically. The new migration adds draft and idempotency fields to the existing
`Post` table. Bot posts appear in the existing blog only after publication, at
`/bg/blog/<slug>`. Uploaded photos use the existing persistent `backend/media`
volume in production. The site has no author directory, so `authors` is empty;
category names and optional tags appear through the existing blog tag display.


Проект запускается из корня через Docker Compose.

#### Запуск (dev)
``` bash
docker compose -f docker-compose.dev.yml up --build
```

Перед запуском заполните корневой `.env` на основе `.env.sample`.
Для Stripe используйте только test keys: `sk_test_...` и `pk_test_...`.
`price_id` хранится у конкретного курса в админке, а не в `.env`.

Backend: 
http://localhost:8000

Документация API:
http://localhost:8000/api/docs/

Фронтенд:
http://localhost:3000

Dev superuser в fixture:
- username: `admin`
- password: `admin`
- загрузка: `python manage.py loaddata api/fixtures/initial_data.json`

Stripe test checkout
- Checkout session endpoint: `POST /api/create-checkout-session/`
- Webhook endpoint: `POST /api/stripe/webhook/`
- Страница оплаты: `http://localhost:3000/bg/checkout/fullstack-essentials`
- Return URLs формируются backend из относительных путей `/success` и `/cancel`
- Тестовая карта: `4242 4242 4242 4242`

В dev-режиме при каждом старте backend-контейнера данные БД очищаются (`flush`) и вся fixture загружается автоматически.

#### Остановка
``` bash
docker compose -f docker-compose.dev.yml down
```

#### Запуск на VPS (prod, сборка локально из проекта)
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

#### Остановка на VPS (prod)
```bash
docker compose -f docker-compose.prod.yml down
```
