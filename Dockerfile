FROM node:6.3.0
#RUN apt-get update
#RUN apt-get install -y vim

RUN mkdir /usr/local/app
WORKDIR /usr/local/app

ADD ./package.json /usr/local/app

RUN npm install -g 

ADD . /usr/local/app