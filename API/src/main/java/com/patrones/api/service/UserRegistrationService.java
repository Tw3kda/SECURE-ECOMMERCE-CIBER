package com.patrones.api.service;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserRegistrationService {

    @Autowired
    private Keycloak keycloak;

    @Value("${keycloak.realm}")
    private String realm;

    public String registerUser(String username, String email, String password) {
        try {
            System.out.println("=== CREATING AND DISABLING USER ===");
            
            // Crear usuario primero
            UserRepresentation user = new UserRepresentation();
            user.setUsername(username);
            user.setEmail(email);
            user.setEnabled(true);  // Crear habilitado temporalmente
            user.setEmailVerified(false);
            user.setFirstName("Pending");
            user.setLastName("Approval");

            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue(password);
            credential.setTemporary(false);

            user.setCredentials(Collections.singletonList(credential));

            var response = keycloak.realm(realm).users().create(user);
            
            if (response.getStatus() == 201) {
                // Obtener el ID del usuario recién creado
                String userId = extractUserIdFromLocation(response.getLocation());
                
                if (userId != null) {
                    // Deshabilitar el usuario inmediatamente después de crearlo
                    UserRepresentation userToUpdate = new UserRepresentation();
                    userToUpdate.setEnabled(false);  // ✅ Deshabilitar
                    
                    keycloak.realm(realm).users().get(userId).update(userToUpdate);
                    System.out.println("✅ User created and disabled successfully");
                }
                
                return "User registered successfully! (User is disabled)";
            } else {
                return "Failed to register user. Status: " + response.getStatus();
            }
            
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return "Error registering user: " + e.getMessage();
        }
    }
    
    private String extractUserIdFromLocation(java.net.URI location) {
        if (location != null) {
            String path = location.getPath();
            String[] segments = path.split("/");
            return segments[segments.length - 1];
        }
        return null;
    }
}