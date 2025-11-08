package com.patrones.api.dto;

import lombok.Data;

@Data
public class PaymentResponse {
    private String transactionId;
    private String token;
    private String cardBin;
    private String cardLast4;
    private String status;
    private Double amount;
    private String currency;
    private boolean usedCoupon;
    private String clientDataId; // ✅ String para UUID
}