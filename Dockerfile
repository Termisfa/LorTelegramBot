FROM node:slim

ENV TZ Europe/Madrid

RUN apt update && apt install -y chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true 

WORKDIR /usr/src/app
COPY --chown=chrome package.json package-lock.json ./



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