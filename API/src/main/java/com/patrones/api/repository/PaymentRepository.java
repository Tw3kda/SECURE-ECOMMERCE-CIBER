package com.patrones.api.repository;

import com.patrones.api.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    boolean existsByIdCompra(Long idCompra);

    Optional<Payment> findByTransactionId(String transactionId);

    
}
