docker stop redis
docker rm redis
#docker stop postgres
#docker rm postgres
docker run --name redis -p 6379:6379 redis redis-server --loglevel verbose
#docker run --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=password postgres -c log_statement=all