FROM node:18-alpine

RUN apk add --no-cache \
  openssl \
  libc6-compat \
  libstdc++ \
  bash \
  curl

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "start:dev"]