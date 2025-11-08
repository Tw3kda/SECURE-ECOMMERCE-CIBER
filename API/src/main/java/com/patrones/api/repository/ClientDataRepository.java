package com.patrones.api.repository;

import com.patrones.api.entity.ClientData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientDataRepository extends JpaRepository<ClientData, Long> {
    
    // ✅ Método para buscar por uid (UUID de Keycloak)
    Optional<ClientData> findByUid(String uid);
    
    // ✅ Método para buscar por correo (opcional)
    Optional<ClientData> findByCorreo(String correo);
}