#!/bin/bash

cd /etc/init.d/ && ./redis_6379 start && chkconfig redis_6379 on

/usr/bin/node --experimental-modules --loader /app/bin/custom-loader.mjs /app/bin/www
