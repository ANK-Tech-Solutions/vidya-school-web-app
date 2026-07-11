#!/bin/sh
set -e
# Render sets PORT; Spring Boot reads SERVER_PORT
export SERVER_PORT="${PORT:-${SERVER_PORT:-8080}}"
exec java ${JAVA_OPTS} -jar /app/app.jar
