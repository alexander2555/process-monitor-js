﻿FROM node:current-slim

RUN apt-get update && apt-get install -y procps && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN npm install --production

EXPOSE 3000

CMD ["npm", "start"]