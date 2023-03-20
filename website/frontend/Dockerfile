FROM alpine

ADD web-app /web-app

RUN apk update && apk upgrade \
    && apk add bash vim npm
WORKDIR /web-app
#RUN sed -i 's/localhost/backend/g' ./pages/callback.tsx
# maybe needed, to check!
RUN sed -i '/NEXT_PUBLIC_BACKEND_ENDPOINT/d' ./.env
RUN echo "NEXT_PUBLIC_BACKEND_ENDPOINT=backend:3000" >> ./.env

RUN npm i
RUN npm run build

ENTRYPOINT ["npm", "run", "start", "--trace-warnings"]
