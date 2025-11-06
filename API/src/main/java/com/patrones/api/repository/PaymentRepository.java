package com.patrones.api.repository;

import com.patrones.api.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUid(String uid);
    List<Payment> findByPaymentStatus(String paymentStatus);
}