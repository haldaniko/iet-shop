FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json /app/
RUN npm install

COPY . /app/

EXPOSE 3000

FROM base AS dev

CMD ["npm", "run", "dev"]

FROM base AS builder

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:20-alpine AS prod

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/out /app/out

EXPOSE 3000

CMD ["serve", "-s", "out", "-l", "3000"]