package com.patrones.api.controller;

import com.patrones.api.dto.PaymentRequest;
import com.patrones.api.dto.PaymentResponse;

import com.patrones.api.entity.ClientData;
import com.patrones.api.entity.Payment;
import com.patrones.api.repository.ClientDataRepository;
import com.patrones.api.repository.PaymentRepository;
import com.patrones.api.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ClientDataRepository clientDataRepository;

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/process")
    public PaymentResponse processPayment(@RequestBody PaymentRequest request) {
        return paymentService.processPayment(request);
    }


    @PostMapping("/save")
    public Payment savePayment(@RequestBody PaymentRequest request) {
        Payment payment = new Payment();

        String transactionId = UUID.randomUUID().toString();
        payment.setTransactionId(transactionId);
        payment.setStatus("AUTHORIZED");
        payment.setToken("tok_" + UUID.randomUUID());

        // Información de tarjeta
        if (request.getCardNumber() != null && request.getCardNumber().length() >= 6) {
            payment.setCardBin(request.getCardNumber().substring(0, 6));
            payment.setCardLast4(request.getCardNumber()
                    .substring(request.getCardNumber().length() - 4));
        }

        payment.setCardholderName(request.getCardholderName());
        payment.setExpiryMonth(request.getExpiryMonth());
        payment.setExpiryYear(request.getExpiryYear());

        // Datos del cliente
        if (request.getClientDataId() != null) {
            ClientData clientData = clientDataRepository.findById(request.getClientDataId())
                    .orElse(null);
            if (clientData != null) {
                payment.setClientDataId(clientData.getId());
            }
        }

        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setItems(request.getItems());
        payment.setDireccion(request.getDireccion());
        payment.setUsedCoupon(request.isUsedCoupon());

        Payment savedPayment = paymentRepository.save(payment);
        return savedPayment;
    }

    @GetMapping("/{transactionId}")
    public Payment getPayment(@PathVariable String transactionId) {
        return paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }
}
