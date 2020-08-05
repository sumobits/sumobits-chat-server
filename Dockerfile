FROM node:latest
RUN mkdir -p /usr/sumobits/chat/server
WORKDIR /usr/sumobits/chat/server
COPY package.json /usr/sumobits/chat/server
RUN yarn install
COPY . /usr/sumobits/chat/server
EXPOSE 3000
CMD [ "yarn", "start" ]
