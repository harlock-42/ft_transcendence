FROM node:alpine

ADD server /server

RUN apk update && apk upgrade \
    && apk add bash vim
WORKDIR /server

RUN sed -i 's/localhost/database/g' ./.env
#RUN sed -i '/SHARED_DIR_FULL_PATH/d' ./.env
#RUN echo "SHARED_DIR_FULL_PATH=../sharedFiles/socialFiles" >> ./.env
RUN npm i
RUN npm run build

ENTRYPOINT ["npm", "run", "start"]
