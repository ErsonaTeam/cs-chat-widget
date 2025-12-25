FROM node:21-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --production

COPY /.next ./.next
COPY /public ./public

EXPOSE 3000

CMD ["npm", "start"]

