package com.patrones.api.service;

import com.patrones.api.dto.PaymentRequest;
import com.patrones.api.dto.PaymentResponse;
import com.patrones.api.entity.Payment;
import com.patrones.api.repository.PaymentRepository;
import com.patrones.api.repository.ClientDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ClientDataRepository clientDataRepository;

    // --- Procesar pago ---
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

        // --- Generar idCompra aleatorio y único ---
        Long idCompra;
        do {
            idCompra = ThreadLocalRandom.current().nextLong(100000, 999999);
        } while (paymentRepository.existsByIdCompra(idCompra));

        // --- Crear Payment ---
        Payment payment = new Payment();
        payment.setIdCompra(idCompra);
        payment.setTransactionId(transactionId);
        payment.setToken(token);
        payment.setStatus(status);
        payment.setCardBin(first6);
        payment.setCardLast4(last4);
        payment.setAmount(request.getAmount());
        payment.setCurrency("COP");
        payment.setDireccion(request.getDireccion());
        payment.setClientUid(request.getClientDataId());
        payment.setUsedCoupon(request.isUsedCoupon());
        payment.setFechaPago(LocalDateTime.now());

        // --- Actualizar ClientData si cupón fue usado ---
        if (request.getClientDataId() != null) {
            clientDataRepository.findByUid(request.getClientDataId()).ifPresent(clientData -> {
                if (request.isUsedCoupon() && !clientData.isUsoCodigoDescuento()) {
                    clientData.setUsoCodigoDescuento(true);
                    clientDataRepository.save(clientData);
                    System.out.println("🎉 Cupón activado para cliente: " + clientData.getUid());
                }
            });
        }

        // --- Guardar Payment ---
        paymentRepository.save(payment);

        // --- Construir Response ---
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

        System.out.println("✅ Pago procesado exitosamente: " + transactionId);

        return response;
    }

    // --- Obtener Payment por transactionId ---
    public Payment getPaymentByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    // --- Obtener todos los Payments ---
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    
}
