# Docker

This is the preferred method of deployment for this application. It helps to ensure that the application is running in a consistent environment, and that the application is isolated from the host system.

Please change the values of the environment variables to match your environment.

> [!WARNING]
> Right now, the application is still in its early days. Some features might not work as expected or might not work at all.
> If you encounter any issues, please open an issue on the [GitHub repository](https://github.com/talkarr/talkarr/issues).

> [!NOTE]
> There are multiple version tags available. For the latest stable image, use the `latest` tag.
> For the latest commit, use the `nightly` tag.
> For a specific version, use the version number as the tag, e.g. `v1.0.0`. You can find the releases [here](https://github.com/talkarr/talkarr/releases).

> [!NOTE]
> We do not support using the docker.io registry anymore.
> In case you are using the docker.io image, please migrate to the GitHub Container Registry (ghcr.io).

## Deploying via Docker Compose (Recommended)

For more information about Docker Compose itself, please refer to the [official documentation](https://docs.docker.com/compose/).

For docker-compose, you can use this `.env` file as is and it should work:

```bash
POSTGRES_USER=talkarr
POSTGRES_PASSWORD=talkarr # Change this to a more secure password
POSTGRES_DB=talkarr
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# postgresql://<username>:<password>@<host>:<port>/<database>?schema=<schema>
DATABASE_URL="postgresql://talkarr:talkarr@db:5432/talkarr?schema=public"
```

This is the most basic docker-compose.yml file that you can use to deploy this application:

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./data:/var/lib/postgresql/data # Store the data from postgres in "./data" directory
    ports:
      - "5432:5432"

  redis:
    image: valkey:8-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
  
  app:
    image: ghcr.io/talkarr/talkarr:latest # from github
    # image: talkarr/talkarr:latest # from docker hub
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "3232:3232"
    volumes:
      - /path/to/your/media:/media # in theory, you can mount it wherever you like
      - ./logs:/app/logs # Store the logs in "./logs" directory
    depends_on:
      - db
      - redis
```

To run the application, you can use the following command:

```bash
docker-compose up -d

# or

docker compose up -d
```

To stop the application, you can use the following command:

```bash
docker-compose down

# or

docker compose down
```

To view the logs of the application, you can use the following command:

```bash
docker-compose logs -f app

# or

docker compose logs -f app
```

And to update the application, you can use the following command:

```bash
docker-compose pull
docker-compose up -d

# or

docker compose pull
docker compose up -d
```

## Deploying via Docker

For normal Docker, you can use this `.env` file as is and it should work:

```bash
POSTGRES_USER=talkarr
POSTGRES_PASSWORD=talkarr # Change this to a more secure password
POSTGRES_DB=talkarr
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# postgresql://<username>:<password>@<host>:<port>/<database>?schema=<schema>
DATABASE_URL="postgresql://talkarr:talkarr@localhost:5432/talkarr?schema=public"
```

If you prefer to deploy the application without using Docker Compose, you can use the following commands:

```bash
docker run -d --name db --env-file .env -v ./data:/var/lib/postgresql/data -p 5432:5432 postgres:16-alpine
docker run -d --name redis -p 6379:6379 valkey/valkey:8-alpine
docker run -d --name app --env-file .env -p 3232:3232 --link db:db --link redis:redis ghcr.io/talkarr/talkarr:latest
```

However, this method is not recommended as it is more difficult to manage the containers and their dependencies.

## Deploying to with existing PostgreSQL and Redis instances

If you already have a PostgreSQL and Redis instance running, you can just set the environment variables accordingly:

```bash
POSTGRES_USER=talkarr
POSTGRES_PASSWORD=talkarr # Change this to a more secure password
POSTGRES_DB=talkarr
POSTGRES_HOST=localhost # Change this to the hostname of your PostgreSQL instance
POSTGRES_PORT=5432 # Change this to the port of your PostgreSQL instance

REDIS_HOST=localhost # Change this to the hostname of your Redis instance
REDIS_PORT=6379 # Change this to the port of your Redis instance
REDIS_PASSWORD=

# postgresql://<username>:<password>@<host>:<port>/<database>?schema=<schema>
DATABASE_URL="postgresql://talkarr:talkarr@localhost:5432/talkarr?schema=public"
```

Then you can run the application using the following docker-compose file:

```yaml
services:
  app:
    image: ghcr.io/talkarr/talkarr:latest
    # image: talkarr/talkarr:latest
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "3232:3232"
    volumes:
      - /path/to/your/media:/media # in theory, you can mount it wherever you like
      - ./logs:/app/logs # Store the logs in "./logs" directory
```

Or you can run the application using the following command:

```bash
docker run -d --name app --env-file .env -p 3232:3232 ghcr.io/talkarr/talkarr:latest
```
