# Docker

This is the preferred method of deployment for this application. It helps to ensure that the application is running in a consistent environment, and that the application is isolated from the host system.

## Prerequisites

Before deploying the application, you need to create a `.env` file.

```bash
# This is for development only. Please use environment variables for production.

POSTGRES_USER=talkarr
POSTGRES_PASSWORD=talkarr
POSTGRES_DB=talkarr
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

REDIS_HOST=localhost
REDIS_PORT=6379

# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="postgresql://talkarr:talkarr@localhost:5432/talkarr?schema=public"

# Docker-Compose:
# DATABASE_URL="postgresql://talkarr:talkarr@db:5432/talkarr?schema=public"
```

Please change the values of the environment variables to match your environment.

## Deploying via Docker Compose (Recommended)

This is the most basic docker-compose.yml file that you can use to deploy this application:

```yaml
services:
  db:
    image: postgres:16-alpine
    env_file:
      - .env
    volumes:
      - ./data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  app:
    image: ghcr.io/talkarr/talkarr:latest
    env_file:
      - .env
    ports:
      - "3232:3232"
    depends_on:
      - db
      - redis
```

## Deploying via Docker

If you prefer to deploy the application without using Docker Compose, you can use the following commands:

```bash
docker run -d --name db --env-file .env -v ./data:/var/lib/postgresql/data -p 5432:5432 postgres:16-alpine
docker run -d --name redis -p 6379:6379 redis:7-alpine
docker run -d --name app --env-file .env -p 3232:3232 --link db:db --link redis:redis ghcr.io/talkarr/talkarr:latest
```

However, this method is not recommended as it is more difficult to manage the containers and their dependencies.
