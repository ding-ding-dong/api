#!/bin/bash

cd /etc/init.d/ && ./redis_6379 start

graceful_shutdown_redis() {
  cd /etc/init.d/ && ./redis_6379 stop
}
trap 'graceful_shutdown_redis' SIGTERM SIGINT

# & executes a command in the background in a subshell, and will return 0 regardless of its status.
/usr/bin/node --experimental-modules --loader /app/bin/custom-loader.mjs /app/bin/www &

# $! contains the process ID of the most recently executed background pipeline.
wait $!
