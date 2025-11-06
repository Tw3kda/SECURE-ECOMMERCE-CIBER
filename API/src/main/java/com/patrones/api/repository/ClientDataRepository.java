package com.patrones.api.repository;

import com.patrones.api.entity.ClientData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClientDataRepository extends JpaRepository<ClientData, Long> {
    List<ClientData> findByUid(String uid);
    Optional<ClientData> findByIdAndUid(Long id, String uid);
}