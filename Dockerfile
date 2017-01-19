FROM iojs:3.3

ADD package.json /tmp/package.json
RUN cd /tmp && npm install

RUN mkdir -p /usr/local/app && cp -a /tmp/node_modules /usr/local/app
WORKDIR /usr/local/app

#RUN echo '#!/bin/bash\n./tmp/node_modules/gulp/bin/gulp.js' > /usr/bin/gulp
#RUN chmod +x /usr/bin/gulp

RUN ln -s /tmp/node_modules/gulp/bin/./gulp.js /usr/bin/gulp

ADD . /usr/local/app

EXPOSE 3000