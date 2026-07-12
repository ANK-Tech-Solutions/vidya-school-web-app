#!/bin/sh
set -e
# Render injects PORT (often 10000). Always bind that port on 0.0.0.0.
PORT="${PORT:-${SERVER_PORT:-8080}}"
export PORT
export SERVER_PORT="${PORT}"
echo "Binding HTTP server to 0.0.0.0:${PORT}"
# shellcheck disable=SC2086
exec java ${JAVA_OPTS} \
  -Dserver.address=0.0.0.0 \
  -Dserver.port="${PORT}" \
  -jar /app/app.jar
