package com.patrones.api.repository;

import com.patrones.api.entity.ClientData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientDataRepository extends JpaRepository<ClientData, Long> {
    Optional<ClientData> findByUid(String uid);
}
