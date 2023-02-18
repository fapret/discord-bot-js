#TODO FINISH DOCKERFILE
FROM node:16

WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY package.json /usr/src/app/`
RUN apt update
RUN apt install -y ffmpeg
RUN apt install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
RUN npm install

COPY . /usr/src/app

EXPOSE 443
EXPOSE 80
CMD [ "npm", "startback" ]