package com.patrones.api.service;

import com.patrones.api.dto.PaymentRequest;
import com.patrones.api.dto.PaymentResponse;
import com.patrones.api.entity.Payment;
import com.patrones.api.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;


import java.time.LocalDateTime;


@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    public PaymentResponse processPayment(PaymentRequest request) {

        // --- Prepare masked card info ---
        String first6 = request.getCardNumber() != null && request.getCardNumber().length() >= 6
                ? request.getCardNumber().substring(0, 6)
                : "000000";
        String last4 = request.getCardNumber() != null && request.getCardNumber().length() >= 4
                ? request.getCardNumber().substring(request.getCardNumber().length() - 4)
                : "0000";

        // --- Dummy tokenization ---
        String token = "tok_" + UUID.randomUUID();
        String transactionId = "txn_" + UUID.randomUUID();
        String status = "AUTHORIZED";

        // --- Save only safe data in DB ---
        Payment payment = new Payment();
        payment.setTransactionId(transactionId);
        payment.setToken(token);
        payment.setStatus(status);
        payment.setCardBin(first6);
        payment.setCardLast4(last4);
        payment.setAmount(request.getAmount());
        payment.setCurrency("COP");
        payment.setDireccion(request.getDireccion());
        payment.setClientUid(request.getClientDataId()); // ✅ Usar clientUid en lugar de clientDataId
        payment.setUsedCoupon(request.isUsedCoupon());
        payment.setFechaPago(LocalDateTime.now());

        paymentRepository.save(payment);

        // --- Build response ---
        PaymentResponse response = new PaymentResponse();
        response.setTransactionId(transactionId);
        response.setToken(token);
        response.setCardBin(first6);
        response.setCardLast4(last4);
        response.setStatus(status);
        response.setAmount(request.getAmount());
        response.setCurrency("COP");
        response.setUsedCoupon(request.isUsedCoupon());
        response.setClientDataId(request.getClientDataId());

        // Log para debugging
        System.out.println("✅ Pago procesado exitosamente");
        System.out.println("📧 Transaction ID: " + transactionId);
        System.out.println("👤 Cliente UID: " + request.getClientDataId());
        System.out.println("💵 Monto: " + request.getAmount());
        System.out.println("🎫 Cupón usado: " + request.isUsedCoupon());

        return response;
    }
}