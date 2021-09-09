#!/bin/bash

# cd /etc/init.d/ && ./redis_6379 start

echo `cat /var/run/redis_6379.pid`
/usr/local/bin/redis-server /etc/redis/6379.conf

/usr/bin/node --experimental-modules --loader /app/bin/custom-loader.mjs /app/bin/www
