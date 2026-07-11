# Multi-stage build for School Bus Management Backend
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw
RUN chmod +x mvnw && ./mvnw -q dependency:go-offline -B || true
COPY src ./src
RUN ./mvnw -q -DskipTests package -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S schoolbus && adduser -S schoolbus -G schoolbus
COPY --from=build /app/target/*.jar app.jar
USER schoolbus
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD wget -qO- http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
