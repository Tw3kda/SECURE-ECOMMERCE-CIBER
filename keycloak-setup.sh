#!/bin/bash

# Read admin credentials from secret files if they exist
if [ -f "/run/secrets/KEYCLOAK_ADMIN" ]; then
  export KEYCLOAK_ADMIN=$(cat /run/secrets/KEYCLOAK_ADMIN)
fi

if [ -f "/run/secrets/KEYCLOAK_ADMIN_PASSWORD" ]; then
  export KEYCLOAK_ADMIN_PASSWORD=$(cat /run/secrets/KEYCLOAK_ADMIN_PASSWORD)
fi

# Set default values if secrets not found
export KEYCLOAK_ADMIN=${KEYCLOAK_ADMIN:-admin}
export KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD:-admin123}

echo "Starting Keycloak with admin user: $KEYCLOAK_ADMIN"

# Start Keycloak with the credentials
exec /opt/keycloak/bin/kc.sh start-dev \
  --https-port=8443 \
  --https-key-store-file=/opt/keycloak/conf/keycloak-keystore.p12 \
  --https-key-store-password=password \
  --hostname-strict=false \
  --hostname-strict-https=false \
  --proxy=edge