FROM node:12-alpine

RUN apk add --no-cache tzdata
ENV TZ Europe/Madrid

RUN apk add --no-cache  chromium --repository=http://dl-cdn.alpinelinux.org/alpine/v3.10/main


ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
WORKDIR /usr/src/app
COPY --chown=chrome package.json package-lock.json ./




#RUN set -ex \
#    \
#    && apk add --no-cache chromium \
#    \
#    && mkdir /data \
#    && chown nobody /data



RUN npm install
COPY --chown=chrome . ./
#COPY  ./Checker/checkBot.sh ./Checker/checkBot.sh

VOLUME /usr/src/app/checker


CMD ["./startBot.sh"]
	
#docker buildx build --platform linux/amd64,linux/arm/v7 -t termisfa/lorbot --push .
#docker run -d --name bot -v /home/pi/checker:/usr/src/app/checker termisfa/lorbot

#TESTS
#docker buildx build -t termisfa/test --push .
#docker buildx build --platform linux/amd64,linux/arm/v7 -t termisfa/test --push .
#docker run -d --name test -v C:\Users\Public\checker:/usr/src/app/checker termisfa/test

#docker exec -it test /bin/sh