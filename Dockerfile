FROM node:latest
USER root

MAINTAINER Kevin Richter<me@kevinrichter.nl>

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

# Bundle app source
COPY . .

ENV MONGO_HOST=localhost

EXPOSE 3000

CMD ["npm", "start"]