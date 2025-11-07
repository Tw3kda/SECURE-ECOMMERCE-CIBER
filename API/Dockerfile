# ---------- 1️⃣ Build Stage ----------
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml and download dependencies first (for build caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the rest of the source
COPY src ./src

# Build the JAR
RUN mvn clean package -DskipTests

# ---------- 2️⃣ Runtime Stage ----------
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy compiled JAR
COPY --from=builder /app/target/*.jar app.jar

# El keystore ya está dentro del JAR (classpath), no necesitas copiarlo por separado

EXPOSE 8443

CMD ["java", "-jar", "app.jar"]