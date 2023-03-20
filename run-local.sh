#!/bin/bash

db_container_name="postgres_for_local"
db_name="dbdata"

docker volume ls | grep $db_name
if [ $? -eq 1 ]; then
    echo "Please run 'docker-compose up' at least one time to create the volume."
    exit 1
fi

docker ps -a | grep $db_container_name
if [ $? -eq 1 ]; then
    docker run -d --name $db_container_name \
        --env-file website/backend/server/.env \
        -v transdata:/var/lib/postgresql/data \
        -p '5432:5432' \
        postgres -c listen_addresses='*' \
        -c port='5432'
else
    docker start $db_container_name
fi

npm --prefix ./website/backend/server run start:dev
