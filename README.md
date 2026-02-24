### Deployment (Docker)

Проект запускается из корня через Docker Compose.

#### Запуск
``` bash
docker compose up --build
```

Backend: 
http://localhost:8000

Документация API:
http://localhost:8000/api/docs/

Фронтенд:
http://localhost:3000

#### Остановка
``` bash
docker compose down
```

#### Пересборка после изменений зависимостей
```  bash
docker compose build --no-cache
docker compose up
```