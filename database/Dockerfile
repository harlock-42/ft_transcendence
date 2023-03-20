FROM postgres:latest

RUN apk update && apk upgrade \
    && apk add vim

COPY ./postgresql.conf /etc/postgresql/