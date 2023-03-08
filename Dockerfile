FROM node:16-bullseye-slim
ENV NODE_ENV=production

LABEL author="Fapret"

RUN apt update
RUN apt install -y git ffmpeg ca-certificates dnsutils tzdata zip tar curl libtool
RUN apt install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
RUN npm install npm@latest -g

WORKDIR /app

COPY ./main.js ./main.js
COPY ./webserver.js ./webserver.js
COPY ./webconfig.json ./webconfig.json
COPY ./config.json ./config.json
COPY ./modules ./modules
COPY ./plugins ./plugins
COPY ./views ./views
COPY ./Routers ./Routers
COPY ./lang ./lang

CMD [ "npm", "startback" ]