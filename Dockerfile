FROM node:21-alpine

WORKDIR /app

COPY package.json package-lock.json ./

# The id=npmrc matches the --secret id=npmrc in the docker build command
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc \
    npm ci --omit=dev

COPY /.next ./.next
COPY /public ./public

EXPOSE 3000

CMD ["npm", "start"]