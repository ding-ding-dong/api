#!/bin/bash

cd /etc/init.d/ && ./redis_6379 start

/usr/bin/node --experimental-modules --loader /app/bin/custom-loader.mjs /app/bin/www
