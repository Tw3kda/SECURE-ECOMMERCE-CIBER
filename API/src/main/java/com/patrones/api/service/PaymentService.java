package com.patrones.api.service;

import com.patrones.api.dto.PaymentRequest;
import com.patrones.api.dto.PaymentResponse;
import com.patrones.api.entity.Payment;
import com.patrones.api.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    private final Map<String, String> transactions = new ConcurrentHashMap<>();

    public PaymentResponse processPayment(PaymentRequest request) {

        String cardNumber = request.getCardNumber();
        String first6 = cardNumber != null && cardNumber.length() >= 6
                ? cardNumber.substring(0, 6)
                : "000000";
        String last4 = cardNumber != null && cardNumber.length() >= 4
                ? cardNumber.substring(cardNumber.length() - 4)
                : "0000";

        String token = "tok_" + UUID.randomUUID();
        String transactionId = "txn_" + UUID.randomUUID();
        String status = "AUTHORIZED";

        transactions.put(transactionId, status);

        Payment payment = new Payment();
        payment.setTransactionId(transactionId);
        payment.setStatus(status);
        payment.setToken(token);
        payment.setCardBin(first6);
        payment.setCardLast4(last4);
        payment.setCardholderName(request.getCardholderName());

        // Convertir los campos numéricos si vienen como String
        try {
            payment.setExpiryMonth(request.getExpiryMonth());
            payment.setExpiryYear(request.getExpiryYear());
        } catch (Exception e) {
            System.err.println("⚠ Error parsing expiry date: " + e.getMessage());
        }

        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setItems(request.getItems());
        payment.setDireccion(request.getDireccion());
        payment.setClientDataId(request.getClientDataId());
        payment.setUsedCoupon(request.isUsedCoupon());

        paymentRepository.save(payment);

        PaymentResponse response = new PaymentResponse();
        response.setTransactionId(transactionId);
        response.setStatus(status);
        response.setToken(token);
        response.setCardBin(first6);
        response.setCardLast4(last4);
        response.setCardholderName(request.getCardholderName());
        response.setExpiryMonth(request.getExpiryMonth());
        response.setExpiryYear(request.getExpiryYear());
        response.setUsedCoupon(request.isUsedCoupon());

        return response;
    }
}
