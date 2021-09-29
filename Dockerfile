FROM node:16.6.0 AS build

WORKDIR /home/node/bot

COPY package.json yarn.lock ./
COPY patches patches
COPY app app
RUN yarn --frozen-lockfile

COPY . ./

RUN yarn build
RUN ls

FROM node:16.6.0-alpine

EXPOSE 1204

WORKDIR /home/node/bot

RUN apk add --update make gcc g++ python3 git

COPY package.json yarn.lock ./
COPY patches/ patches
RUN yarn --frozen-lockfile --production

RUN ls
COPY --from=build /home/node/bot/dist/ dist
COPY app app

CMD [ "yarn", "start" ]