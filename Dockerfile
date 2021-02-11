

FROM node:lts-alpine3.12

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
WORKDIR /usr/src/app
COPY --chown=chrome package.json package-lock.json ./
RUN set -ex \
    \
    && apk add --no-cache chromium \
    \
    && mkdir /data \
    && chown nobody /data



RUN npm install
COPY --chown=chrome . ./

CMD ["node", "index.js"]
	
	
