#!/bin/bash
set -e

# 🧩 Read secrets into environment variables if present
if [ -f /run/secrets/KEYCLOAK_ADMIN ]; then
  export KEYCLOAK_USERNAME=$(cat /run/secrets/KEYCLOAK_ADMIN)
fi

if [ -f /run/secrets/KEYCLOAK_ADMIN_PASSWORD ]; then
  export KEYCLOAK_PASSWORD=$(cat /run/secrets/KEYCLOAK_ADMIN_PASSWORD)
fi

if [ -f /run/secrets/SERVER_SSL_KEY_STORE_PASSWORD ]; then
  export SERVER_SSL_KEY_STORE_PASSWORD=$(cat /run/secrets/SERVER_SSL_KEY_STORE_PASSWORD)
fi

if [ -f /run/secrets/KEYCLOAK_BACKEND_SERVICE ]; then
  export KEYCLOAK_BACKEND_CLIENT_SECRET=$(cat /run/secrets/KEYCLOAK_BACKEND_SERVICE)
fi

echo "✅ Loaded secrets. Starting Spring Boot app..."

# Run the Spring Boot JAR (adjust name if needed)
exec java -jar /app/target/demo-0.0.1-SNAPSHOT.jar
