package com.patrones.api.config;

import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Files;
import java.nio.file.Paths;

@Configuration
public class KeycloakAdminConfig {

    @Value("${keycloak.auth-server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.resource}")
    private String clientId;

    @Bean
    public Keycloak keycloak() {
        try {
            // Read secret directly from Docker secrets file
            String secretPath = "/run/secrets/KEYCLOAK_BACKEND_CLIENT_SECRET";
            String clientSecret = Files.readString(Paths.get(secretPath)).trim();
            
            System.out.println("=== Keycloak Configuration ===");
            System.out.println("Using secret: " + clientSecret.substring(0, 5) + "...");
            
            return KeycloakBuilder.builder()
                    .serverUrl(serverUrl)
                    .realm(realm)
                    .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                    .clientId(clientId)
                    .clientSecret(clientSecret)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to read Keycloak client secret from: " + 
                "/run/secrets/KEYCLOAK_BACKEND_CLIENT_SECRET", e);
        }
    }
}