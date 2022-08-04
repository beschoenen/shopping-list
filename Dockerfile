FROM node:17-alpine

MAINTAINER Kevin Richter

ENV MONGO_HOST localhost
ENV MONGO_PORT 27017
ENV MONGO_DB shopping-list
ENV PORT 9500

WORKDIR /tmp

RUN apk add \
    make \
    gcc \
    g++ \
    python3 \
    wget \
    bash;

RUN wget -O wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
RUN chmod +x wait-for-it.sh
RUN mv wait-for-it.sh  /usr/local/bin/wait-for-it

RUN echo "wait-for-it \$MONGO_HOST:\$MONGO_PORT -- npm start" > /docker-boot.sh
RUN chmod +x /docker-boot.sh

WORKDIR /app

COPY . .

RUN npm ci

RUN apk del \
    make \
    gcc \
    g++ \
    python3;

CMD ["sh", "/docker-boot.sh"]
