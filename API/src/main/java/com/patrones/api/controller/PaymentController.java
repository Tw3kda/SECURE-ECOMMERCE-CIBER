package com.patrones.api.controller;

import com.patrones.api.dto.PaymentRequest;
import com.patrones.api.dto.PaymentResponse;
import com.patrones.api.entity.Payment;
import com.patrones.api.repository.PaymentRepository;
import com.patrones.api.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentService paymentService;

    // ✅ Process payment via service
    @PostMapping("/process")
    public PaymentResponse processPayment(@RequestBody PaymentRequest request) {
        return paymentService.processPayment(request);
    }

    // ✅ Save payment (masked card info only, PCI-compliant)
    @PostMapping("/save")
    public Payment savePayment(@RequestBody PaymentRequest request) {
        Payment payment = new Payment();

        // Generate transaction ID and dummy token
        String transactionId = UUID.randomUUID().toString();
        payment.setTransactionId(transactionId);
        payment.setStatus("AUTHORIZED");
        payment.setToken("tok_" + UUID.randomUUID());

        // Masked card info only
        if (request.getCardNumber() != null && request.getCardNumber().length() >= 6) {
            payment.setCardBin(request.getCardNumber().substring(0, 6));
            payment.setCardLast4(request.getCardNumber()
                    .substring(request.getCardNumber().length() - 4));
        }

        // Safe fields only
        payment.setAmount(request.getAmount());
        payment.setCurrency("USD");
        payment.setItems(request.getItems());
        payment.setDireccion(request.getDireccion());
        payment.setUsedCoupon(request.isUsedCoupon());
        payment.setClientDataId(request.getClientDataId()); // ✅ Direct String assignment

        // Log para debugging
        if (request.getClientDataId() != null) {
            System.out.println("🧾 Procesando pago para cliente UUID: " + request.getClientDataId());
            System.out.println("💳 Cupón usado: " + request.isUsedCoupon());
            System.out.println("💰 Monto: " + request.getAmount());
        }

        return paymentRepository.save(payment);
    }

    // ✅ Fetch payment by transaction ID
    @GetMapping("/{transactionId}")
    public Payment getPayment(@PathVariable String transactionId) {
        return paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    // ✅ Admin-only endpoint: fetch all payments
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
}