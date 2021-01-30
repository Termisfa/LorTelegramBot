FROM node


WORKDIR /testDocker

COPY package*.json ./

#ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
#ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

#RUN apt-get update
#RUN apt-get install chromium -y

RUN npm install

COPY . .

CMD node index.js

# EXPOSE 8081
	
	
