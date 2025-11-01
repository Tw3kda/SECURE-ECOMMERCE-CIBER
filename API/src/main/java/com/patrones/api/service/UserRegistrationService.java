package com.patrones.api.service;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.ws.rs.core.Response;
import java.util.Collections;

@Service
public class UserRegistrationService {

    @Autowired
    private Keycloak keycloak;

    @Autowired
    private String keycloakTargetRealm;

    public String registerUser(String username, String email, String password) {
        UserRepresentation user = new UserRepresentation();
        user.setUsername(username);
        user.setEmail(email);
        user.setEnabled(false); // 🔒 user disabled by default
        user.setEmailVerified(false);

        Response response = keycloak.realm(keycloakTargetRealm)
                .users()
                .create(user);

        if (response.getStatus() != 201) {
            return "Error creating user: " + response.getStatusInfo().toString();
        }

        String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");

        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setTemporary(false);
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);

        keycloak.realm(keycloakTargetRealm)
                .users()
                .get(userId)
                .resetPassword(credential);

        return "User registered successfully, pending admin activation.";
    }
}
