# Multi-stage build for School Bus Management Backend (Render / Docker)
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw
COPY mvnw.cmd mvnw.cmd
RUN chmod +x mvnw || true
COPY src ./src
RUN ./mvnw -q -DskipTests package -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN apk add --no-cache wget \
  && addgroup -S schoolbus && adduser -S schoolbus -G schoolbus
COPY --from=build /app/target/*.jar app.jar
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh
USER schoolbus
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080
# Faster cold start on small Render instances (TieredStopAtLevel=1)
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:TieredStopAtLevel=1 -Djava.security.egd=file:/dev/./urandom"
HEALTHCHECK --interval=30s --timeout=5s --start-period=180s --retries=5 \
  CMD wget -qO- http://127.0.0.1:${SERVER_PORT:-8080}/actuator/health || exit 1
ENTRYPOINT ["/app/docker-entrypoint.sh"]
