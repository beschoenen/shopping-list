FROM mhart/alpine-node:latest
USER root

MAINTAINER Kevin Richter<me@kevinrichter.nl>

WORKDIR /app

COPY . .

RUN apk add --no-cache make gcc g++ python
RUN npm ci --only=production --no-color

ENV MONGO_HOST localhost
ENV MONGO_DB shopping-list

EXPOSE 9500

CMD ["npm", "start"]
