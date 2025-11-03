package com.patrones.api.controller;

import org.keycloak.admin.client.Keycloak;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
public class TestController {
    
    @Autowired
    private Keycloak keycloak;
    
    // REMOVE THIS LINE - it's causing the error
    // @Value("${keycloak.credentials.secret}")
    // private String configuredSecret;
    
    @GetMapping("/test")
    public Map<String, Object> debugKeycloak() {
        Map<String, Object> debugInfo = new HashMap<>();
        
        try {
            // Check environment variables
            debugInfo.put("env_KEYCLOAK_CLIENT_SECRET", 
                System.getenv("KEYCLOAK_CLIENT_SECRET") != null ? 
                "[" + System.getenv("KEYCLOAK_CLIENT_SECRET").length() + " chars]" : "NULL");
            
            // Check Docker secret file
            String secretPath = "/run/secrets/KEYCLOAK_BACKEND_CLIENT_SECRET";
            File secretFile = new File(secretPath);
            debugInfo.put("secretFileExists", secretFile.exists());
            if (secretFile.exists()) {
                try {
                    String fileContent = Files.readString(Paths.get(secretPath)).trim();
                    debugInfo.put("fileSecretLength", fileContent.length());
                    debugInfo.put("fileSecretPreview", 
                        fileContent.substring(0, Math.min(5, fileContent.length())) + "...");
                } catch (Exception e) {
                    debugInfo.put("fileReadError", e.getMessage());
                }
            }
            
            // Test Keycloak connection
            try {
                String token = keycloak.tokenManager().getAccessTokenString();
                debugInfo.put("keycloakConnection", "SUCCESS");
                debugInfo.put("tokenPreview", token.substring(0, 20) + "...");
            } catch (Exception e) {
                debugInfo.put("keycloakConnection", "FAILED: " + e.getMessage());
            }
            
        } catch (Exception e) {
            debugInfo.put("error", e.getMessage());
        }
        
        return debugInfo;
    }
}