#!/bin/bash
set -e

echo "🔧 Starting Spring Boot application..."

# 🧩 Read secrets into environment variables if present
if [ -f /run/secrets/KEYCLOAK_ADMIN ]; then
    export KEYCLOAK_USERNAME=$(cat /run/secrets/KEYCLOAK_ADMIN)
    echo "✅ Loaded KEYCLOAK_ADMIN"
fi

if [ -f /run/secrets/KEYCLOAK_ADMIN_PASSWORD ]; then
    export KEYCLOAK_PASSWORD=$(cat /run/secrets/KEYCLOAK_ADMIN_PASSWORD)
    echo "✅ Loaded KEYCLOAK_ADMIN_PASSWORD"
fi

if [ -f /run/secrets/SERVER_SSL_KEY_STORE_PASSWORD ]; then
    export SERVER_SSL_KEY_STORE_PASSWORD=$(cat /run/secrets/SERVER_SSL_KEY_STORE_PASSWORD)
    echo "✅ Loaded SERVER_SSL_KEY_STORE_PASSWORD"
fi

if [ -f /run/secrets/KEYCLOAK_BACKEND_CLIENT_SECRET ]; then
    export KEYCLOAK_BACKEND_CLIENT_SECRET=$(cat /run/secrets/KEYCLOAK_BACKEND_CLIENT_SECRET)
    echo "✅ Loaded KEYCLOAK_BACKEND_CLIENT_SECRET"
fi

if [ -f /run/secrets/DB_PASSWORD ]; then
    export DB_PASSWORD=$(cat /run/secrets/DB_PASSWORD)
    echo "✅ Loaded DB_PASSWORD"
fi

echo "🎯 All secrets loaded. Starting Spring Boot app..."

# Run the Spring Boot JAR - CORREGIDO: usa /app/app.jar
exec java -jar /app/app.jar "$@"