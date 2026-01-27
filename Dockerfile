FROM node:21-alpine

WORKDIR /app

COPY package.json package-lock.json ./

# Install production dependencies using BuildKit secret mount with increased memory
# The secret is mounted at /run/secrets/npmrc and never stored in the image
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm install --production && \
    npm cache clean --force

COPY /.next ./.next
COPY /public ./public
COPY next.config.ts ./

EXPOSE 3000

CMD ["npm", "start"]