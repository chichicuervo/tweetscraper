FROM ubuntu:18.04

LABEL name="tweetscraper" \
      version="0.1"

ENV DEBIAN_FRONTEND=noninteractive
ENV DISPLAY :0

RUN apt-get update
RUN apt-get -yq install curl git wget sudo gpg \
        xvfb gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
        libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 \
        libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
        libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 \
        libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils && \
    rm -rf /var/lib/apt/lists/*
RUN curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -

RUN apt-get update
RUN apt-get -yq install nodejs dumb-init

COPY . /www

WORKDIR /www

RUN rm -rf node_modules/ && npm install || \
    ((if [ -f npm-debug.log ]; then \
        cat npm-debug.log; \
    fi) && false)
RUN npm run build

EXPOSE 80

ENTRYPOINT [ "dumb-init" , "--"]
CMD ["npm", "run", "start:prod"]
