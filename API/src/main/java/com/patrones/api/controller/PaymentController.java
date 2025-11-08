package com.patrones.api.controller;

import com.patrones.api.dto.PaymentRequest;
import com.patrones.api.dto.PaymentResponse;
import com.patrones.api.entity.ClientData;
import com.patrones.api.entity.Payment;
import com.patrones.api.repository.ClientDataRepository;
import com.patrones.api.repository.PaymentRepository;
import com.patrones.api.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // ✅ Endpoint único para procesar y guardar el pago
    @PostMapping("/process")
    public PaymentResponse processPayment(@RequestBody PaymentRequest request) {
        return paymentService.processPayment(request);
    }

    // ✅ Fetch payment por transaction ID
    @GetMapping("/{transactionId}")
    public Payment getPayment(@PathVariable String transactionId) {
        return paymentService.getPaymentByTransactionId(transactionId);
    }

    // ✅ Admin-only endpoint: fetch all payments
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    
}