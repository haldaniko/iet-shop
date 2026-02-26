### Deployment (Docker)

Проект запускается из корня через Docker Compose.

#### Запуск (dev)
``` bash
docker compose -f docker-compose.dev.yml up --build
```

Backend: 
http://localhost:8000

Документация API:
http://localhost:8000/api/docs/

Фронтенд:
http://localhost:3000

#### Остановка
``` bash
docker compose -f docker-compose.dev.yml down
```

#### Пересборка после изменений зависимостей
```  bash
docker compose -f docker-compose.dev.yml up --build --no-cache
```

#### Запуск на VPS (prod, сборка локально из проекта)
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

#### Остановка на VPS (prod)
```bash
docker compose -f docker-compose.prod.yml down
```