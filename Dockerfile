FROM centos:7

RUN curl -sL https://rpm.nodesource.com/setup_8.x | bash - && yum install nodejs -y
RUN yum install gcc gcc-c++ wget make -y

RUN npm install --global yarn

RUN wget https://download.redis.io/releases/redis-6.2.5.tar.gz && tar zxvf redis-6.2.5.tar.gz
RUN cd redis-6.2.5 && make MALLOC=libc && cd src && make install
RUN mkdir /etc/redis && mkdir /var/log/redis && mkdir -p /var/redis/6379 && cp redis-6.2.5/utils/redis_init_script /etc/init.d/redis_6379
COPY redis.conf /etc/redis/6379.conf

ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

WORKDIR /app

COPY . .

RUN yarn

ENTRYPOINT ["/tini", "-g", "--"]
CMD ["./scripts/start.sh"]
