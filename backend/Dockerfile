# Build stage
FROM maven:3.8.5-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
