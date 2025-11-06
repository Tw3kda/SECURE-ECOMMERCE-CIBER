package com.patrones.api.controller;

import com.patrones.api.dto.PaymentRequest;
import com.patrones.api.entity.Payment;
import com.patrones.api.entity.ClientData;
import com.patrones.api.repository.PaymentRepository;
import com.patrones.api.repository.ClientDataRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ClientDataRepository clientDataRepository;

    @PostMapping
    public ResponseEntity<?> createPayment(
            @RequestBody PaymentRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        try {
            String uid = jwt.getClaimAsString("sub");

            // Validaciones básicas
            if (request.getAmount() == null || request.getCurrency() == null) {
                return ResponseEntity.badRequest().body("Amount and currency are required");
            }

            if (request.getAmount() <= 0) {
                return ResponseEntity.badRequest().body("Amount must be greater than 0");
            }

            // Procesar tarjeta (extraer primeros 6 y últimos 4 dígitos)
            String first6 = null;
            String last4 = null;
            
            if (request.getCardNumber() != null && !request.getCardNumber().isBlank()) {
                String pan = request.getCardNumber().replaceAll("\\s+", "");
                
                if (pan.length() >= 10) {
                    first6 = pan.substring(0, 6);
                    last4 = pan.substring(pan.length() - 4);
                } else {
                    return ResponseEntity.badRequest().body("Invalid card number");
                }
            }

            // Buscar ClientData si se proporciona ID
            ClientData clientData = null;
            if (request.getClientDataId() != null) {
                clientData = clientDataRepository.findById(request.getClientDataId()).orElse(null);
            }

            // Crear y guardar el pago
            Payment payment = new Payment();
            payment.setUid(uid);
            payment.setItems(request.getItems());
            payment.setAmount(request.getAmount());
            payment.setCurrency(request.getCurrency().toUpperCase());
            payment.setDireccion(request.getDireccion());
            payment.setCardNumberFirst6(first6);
            payment.setCardNumberLast4(last4);
            payment.setCardholderName(request.getCardholderName());
            payment.setPaymentStatus("PENDING");
            payment.setClientData(clientData);

            Payment savedPayment = paymentRepository.save(payment);

            // Respuesta simple de éxito
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentId", savedPayment.getId());
            response.put("idCompra", savedPayment.getIdCompra());
            response.put("status", savedPayment.getPaymentStatus());
            response.put("message", "Payment created successfully");

            return ResponseEntity.ok(response);

        } catch (Exception ex) {
            ex.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error creating payment");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping
    public ResponseEntity<?> getMyPayments(@AuthenticationPrincipal Jwt jwt) {
        try {
            String uid = jwt.getClaimAsString("sub");
            List<Payment> payments = paymentRepository.findByUid(uid);
            return ResponseEntity.ok(payments);
        } catch (Exception ex) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error retrieving payments");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}