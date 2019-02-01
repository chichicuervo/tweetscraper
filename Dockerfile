FROM ubuntu:bionic

LABEL name="tweetscraper" \
      version="0.1"

ENV DEBIAN_FRONTEND=noninteractive
ENV DISPLAY :0

RUN apt-get update
RUN apt-get -yq install curl git runit wget sudo gpg
RUN curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -

RUN apt-get update
RUN apt-get -yq install nodejs xorg chromium-browser xserver-xorg-video-dummy --no-install-recommends

COPY ./Docker/runit/. /etc/service/
RUN bash -c ' \
    chmod o+x /etc/service/*/run \
'
RUN ["/bin/bash", "-c", "perl -pi -e 's/^(runsvdir)\\s*-P\\s*(.*)/\\1 \\2/' /etc/runit/2"]
RUN ["/bin/bash", "-c", "perl -pi -e 's/^(exec env)\\s*-\\w*\\s*(.*)$/\\1 \\2/' /etc/runit/2"]

COPY . /www

RUN cd /www && rm -rf node_modules/ && npm install || \
    ((if [ -f npm-debug.log ]; then \
        cat npm-debug.log; \
    fi) && false)
RUN cd /www && npm run build

EXPOSE 80

ENTRYPOINT ["runit"]
