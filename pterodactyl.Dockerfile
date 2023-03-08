#DOCKERFILE for use with Pterodactyl
#FROM arm64v8/node:16-bullseye-slim
#FROM amd64/node:16-bullseye-slim
FROM node:16-bullseye-slim

LABEL author="Fapret"

RUN apt update
RUN apt install -y git ffmpeg ca-certificates dnsutils tzdata zip tar curl libtool
RUN apt install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
RUN useradd -m -d /home/container container
RUN npm install npm@latest -g

USER container
ENV USER=container HOME=/home/container
WORKDIR /home/container

COPY ./pterodactyl_entrypoint.sh /entrypoint.sh
CMD [ "/bin/bash", "/entrypoint.sh" ]