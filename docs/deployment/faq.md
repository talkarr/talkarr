# FAQ and common issues

If you encounter any issues or have questions about Talkarr, please check the following frequently asked questions and common issues before reaching out.
If you can't find a solution here, feel free to open an issue on the [GitHub Issues page](https://github.com/talkarr/talkarr/issues/new/choose).

## Server errors

### Database connection failed

On application startup there will be a check if the database is reachable.
This is done by executing a query (`SELECT 1`) and checking if it was successful.
If this fails, Talkarr will not start and log the error `Database connection failed`.

#### Possible causes
- The database is not running or not reachable
  - Check if the database container is running. If you are using the provided docker-compose file, run `docker-compose ps` to see the status of the containers.
  - Check if the database host and port are correct
- The database credentials are incorrect
  - Check if the username and password are correct. As the information is stored in the .env file, this probably is less likely on docker-compose environments.
- The database is not initialized (e.g. missing tables)
  - There are database migrations that should happen on application startup. Check the logs for any errors regarding migrations.
